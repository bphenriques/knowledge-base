{{ $graphData := resources.Get "graph_generator/graph-data.json" | resources.ExecuteAsTemplate "graph-data.json" . | resources.Minify | resources.Fingerprint }}

/**
  Initializes a edge connected graph given the set of nodes and edges provided in graphData.
  Based and adapted from maggiedelano/digital-garden.

  Uses D3 v7.0.1.
*/
(function () {
  const RADIUS = 15;
  const CURRENT_NODE_RADIUS_PROPORTION = 2;

  const TICKS = 100;
  const MAX_LABEL_LENGTH = 50;
  const ZOOM_RANGE = [0.2, 3]
  const GRAPH_DATA_URL = '{{ $graphData.RelPermalink }}';

  const graphWrapper = document.getElementById('graph-wrapper')

  init();
  function init() {
    fetch(GRAPH_DATA_URL)
      .then(pages => pages.json())
      .then(graphData => {
        let nodesData = graphData.nodes;
        let linksData = graphData.edges;

        initGraph(nodesData, linksData)
      });
  }

  function initGraph(nodesData, linksData) {
    const graphSVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    graphWrapper.appendChild(graphSVG);

    // Set SVG shape
    const width = graphWrapper.clientWidth;
    const height = graphWrapper.clientHeight;
    const svg = d3.select("svg");
    const graphSVGGroup = svg.append("g")
       .attr("preserveAspectRatio", "xMinYMin meet")
       .attr("viewBox", `0 0 ${width} ${height}`);
    const linkSVGGroup = graphSVGGroup.append("g").attr("class", "links").selectAll(".links");
    const nodeSVGGroup = graphSVGGroup.append("g").attr("class", "nodes").selectAll(".nodes");
    const labelsSVGGroup = graphSVGGroup.append("g").attr("class", "labels").selectAll(".labels");

    const simulation = d3
      .forceSimulation(nodesData)
      .force("charge", d3.forceManyBody().strength(-2000).distanceMax(450))
      .force("link", d3.forceLink(linksData).id((link) => link.id).distance(50))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(80));

    const zoomHandler = d3
      .zoom()
      .scaleExtent(ZOOM_RANGE)
      .on("zoom", function(event) { onZoom(event.transform, graphSVGGroup) });
    svg.call(zoomHandler);

    restart(nodesData, linksData, simulation, nodeSVGGroup, linkSVGGroup, labelsSVGGroup);
    resetZoom(zoomHandler, svg)
  }

  //TODO: Zoom to current node
  function resetZoom(zoomHandler, svg) {
    let width = Number(svg.attr("width"));
    let height = Number(svg.attr("height"));
    svg.call(
      zoomHandler.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.6)
    );
  }

  function restart(nodesData, linksData, simulation, nodeSVGGroup, linkSVGGroup, labelsSVGGroup) {
      // Remove old information
      nodeSVGGroup.exit().remove();
      linkSVGGroup.exit().remove();
      labelsSVGGroup.exit().remove();

      let newNodes = nodeSVGGroup.data(nodesData, (d) => d.id)
        .enter()
        .append("circle")
        .attr("r", (d) => isCurrentPath(d.path) ? RADIUS * CURRENT_NODE_RADIUS_PROPORTION : RADIUS)
        .attr("active", (d) => isCurrentPath(d.path) ? true : null)
        .merge(nodeSVGGroup);

      let newLinks = linkSVGGroup.data(linksData, (link) => `${link.source.id}-${link.target.id}`)
        .enter()
        .append("line")
        .merge(linkSVGGroup);

      let newLabels = labelsSVGGroup.data(nodesData, (d) => d.label)
        .enter()
        .append("text")
        .text((d) => shorten(d.label.replace(/_*/g, ""), MAX_LABEL_LENGTH))
        .attr("active", (d) => isCurrentPath(d.path) ? true : null)
        .merge(labelsSVGGroup);

      // Add handler after setting the new content
      newNodes
        .on("click", onClick)
        .on("mouseover", function(event, node) { onMouseOver(node, linksData, newNodes, newLinks, newLabels) })
        .on("mouseout", function(event) { onMouseOut(newNodes, newLinks, newLabels) })
      newLabels
        .on("click", onClick)
        .on("mouseover", function(event, node) { onMouseOver(node, linksData, newNodes, newLinks, newLabels) })
        .on("mouseout", function(event) { onMouseOut(newNodes, newLinks, newLabels) })

      d3.range(TICKS).forEach(simulation.tick);

      // Update coordinates for each element after running the simulation
      newNodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      newLabels
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y - (isCurrentPath(d.path) ? RADIUS * CURRENT_NODE_RADIUS_PROPORTION : RADIUS) - 10);
      newLinks.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
  }

  function onZoom(scale, graphSVGGroup) {
    graphSVGGroup.attr("transform", scale);
  }

  function onClick(p, node) {
    window.location = node.path // Go to node's location
  }

  function isCurrentPath(notePath) {
    return window.location.pathname.includes(notePath)
  }

  function onMouseOver(node, linksData, nodeSVGGroup, linkSVGGroup, labelsSVGGroup) {
    const adjacentNodes = new Set();
    linksData
      .filter((link) => link.target.id == node.id || link.source.id == node.id)
      .forEach((link) => {
        adjacentNodes.add(link.target.id);
        adjacentNodes.add(link.source.id);
      });

    const setLabelNodeFocus = (linkData) => {
      if (linkData.id !== node.id && !adjacentNodes.has(linkData.id)) {
        return "unfocus";
      } else {
        return ""
      }
    }

    nodeSVGGroup.attr("class", setLabelNodeFocus);
    labelsSVGGroup.attr("class", setLabelNodeFocus);
    linkSVGGroup.attr("class", (linkData) => {
      if (linkData.source.id != node.id && linkData.target.id != node.id) {
        return "unfocus"
      } else {
        return ""
      }
    });
  }

  function onMouseOut(nodeSVGGroup, linkSVGGroup, labelsSVGGroup) {
    nodeSVGGroup.attr("class", "");
    linkSVGGroup.attr("class", "");
    labelsSVGGroup.attr("class", "");
  }

  function shorten(str, maxLen, separator = ' ') {
    if (str.length <= maxLen) return str;
    return str.substr(0, str.lastIndexOf(separator, maxLen)) + '...';
  }
})();
