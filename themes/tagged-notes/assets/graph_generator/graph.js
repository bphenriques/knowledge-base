{{ $graphData := resources.Get "graph_generator/graph-data.json" | resources.ExecuteAsTemplate "graph-data.json" . | resources.Minify | resources.Fingerprint }}

/**
  Initializes a edge connected graph given the set of nodes and edges provided in graphData.

  Uses D3 v7.0.1.
*/
(function () {
  const RADIUS = 4;
  const CURRENT_NODE_RADIUS_PROPORTION = 2;

  const TICKS = 100;
  const MAX_LABEL_LENGTH = 50;

  const ZOOM_RANGE = [0.2, 3]

  const GRAPH_DATA_URL = '{{ $graphData.RelPermalink }}';

  const input = document.querySelector('#book-search-input');
  const graphWrapper = document.getElementById('graph-wrapper')

  input.addEventListener('focus', init);
  function init() {
    input.removeEventListener('focus', init); // init once

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

    onWindowResize(graphSVG)// First sizing
    graphWrapper.appendChild(graphSVG);
    window.onresize = function() { onWindowResize(graphSVG) };

    // Set SVG shape
    const svg = d3.select("svg");
    const graphSVGGroup = svg.append("g");
    let linkSVGGroup = graphSVGGroup.append("g").attr("class", "links").selectAll(".links");
    let nodeSVGGroup = graphSVGGroup.append("g").attr("class", "nodes").selectAll(".nodes");
    let labelsSVGGroup = graphSVGGroup.append("g").attr("class", "labels").selectAll(".labels");

    let width = Number(svg.attr("width"))
    let height = Number(svg.attr("width"))
    const simulation = d3
      .forceSimulation(nodesData)
      .force("charge", d3.forceManyBody().strength(-2000).distanceMax(450))
      .force("link", d3.forceLink(linksData).id((d) => d.id).distance(30).strength(1))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const zoomHandler = d3
      .zoom()
      .scaleExtent(ZOOM_RANGE)
      .on("zoom", function(event) { onZoom(event.transform, graphSVGGroup) });
    svg.call(zoomHandler);

    restart(nodesData, linksData, simulation, nodeSVGGroup, linkSVGGroup, labelsSVGGroup);
    resetZoom(zoomHandler, svg)
  }

  function resetZoom(zoomHandler, svg) {
    let width = Number(svg.attr("width"));
    let height = Number(svg.attr("height"));
    svg.call(
      zoomHandler.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.2)
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
        .on("click", onClick)
        .merge(nodeSVGGroup);

      let newLinks = linkSVGGroup.data(linksData, (d) => `${d.source.id}-${d.target.id}`)
        .enter()
        .append("line")
        .merge(linkSVGGroup);

      let newLabels = labelsSVGGroup.data(nodesData, (d) => d.label)
        .enter()
        .append("text")
        .text((d) => shorten(d.label.replace(/_*/g, ""), MAX_LABEL_LENGTH))
        .attr("active", (d) => isCurrentPath(d.path) ? true : null)
        .on("click", onClick)
        .merge(labelsSVGGroup);

      d3.range(TICKS).forEach(simulation.tick);

      // Update coordinates for each element after running the simulation
      newNodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      newLabels
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y - (isCurrentPath(d.path) ? RADIUS * CURRENT_NODE_RADIUS_PROPORTION : RADIUS) - 10);
      newLinks.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
  }

  function onWindowResize(graphSVG) {
    graphSVG.setAttribute("width", graphWrapper.getBoundingClientRect().width);
    graphSVG.setAttribute("height", window.innerHeight * 0.8);
    graphWrapper.setAttribute("height", window.innerHeight * 0.8);
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

  function shorten(str, maxLen, separator = ' ') {
    if (str.length <= maxLen) return str;
    return str.substr(0, str.lastIndexOf(separator, maxLen)) + '...';
  }
})();
