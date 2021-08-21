{{ $graphData := resources.Get "graph_generator/graph-data.json" | resources.ExecuteAsTemplate "graph-data.json" . | resources.Minify | resources.Fingerprint }}

(function () {
  const RADIUS = 4;
  const STROKE = 1;
  const FONT_SIZE = 15;
  const TICKS = 100;
  const FONT_BASELINE = 15;
  const MAX_LABEL_LENGTH = 50;
  const INITIAL_ZOOM_LEVEL = 1;

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

    const simulation = d3
      .forceSimulation(nodesData)
      .force("charge", d3.forceManyBody().strength(-4000))
      .force("link", d3.forceLink(linksData).id((d) => d.id).distance(150))
      .force("center", d3.forceCenter(Number(svg.attr("width")) / 2, Number(svg.attr("height")) / 2))
      .stop();

    const zoomHandler = d3
      .zoom()
      .scaleExtent([0.2, 3])
      .on("zoom", function() { onZoom(graphSVGGroup, nodeSVGGroup, linkSVGGroup, labelsSVGGroup) });
    zoomHandler(svg);

    restart(nodesData, linksData, simulation, nodeSVGGroup, linkSVGGroup, labelsSVGGroup);
  }

  function restart(nodesData, linksData, simulation, nodeSVGGroup, linkSVGGroup, labelsSVGGroup) {
      let zoomLevel = INITIAL_ZOOM_LEVEL;

      // Remove old information
      nodeSVGGroup.exit().remove();
      linkSVGGroup.exit().remove();
      labelsSVGGroup.exit().remove();

      let newNodes = nodeSVGGroup.data(nodesData, (d) => d.id)
        .enter()
        .append("circle")
        .attr("r", RADIUS)
        .attr("active", (d) => isCurrentPath(d.path) ? true : null)
        .on("click", onClick)
        .merge(nodeSVGGroup);

      let newLinks = linkSVGGroup.data(linksData, (d) => `${d.source.id}-${d.target.id}`)
        .enter()
        .append("line")
        .attr("stroke-width", STROKE)
        .merge(linkSVGGroup);

      let newLabels = labelsSVGGroup.data(nodesData, (d) => d.label)
        .enter()
        .append("text")
        .text((d) => shorten(d.label.replace(/_*/g, ""), MAX_LABEL_LENGTH))
        .attr("font-size", `${FONT_SIZE}px`)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .attr("active", (d) => isCurrentPath(d.path) ? true : null)
        .on("click", onClick)
        .merge(labelsSVGGroup);

      simulation.nodes(nodesData);
      simulation.force("link").links(linksData);
      simulation.alpha(1).restart();
      simulation.stop();

      for (let i = 0; i < TICKS; i++) {
        simulation.tick();
      }

      // Update coordinates for each element after running the simulation
      newNodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      newLabels.attr("x", (d) => d.x).attr("y", (d) => d.y - FONT_BASELINE / zoomLevel);
      newLinks.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
  }

  function onWindowResize(graphSVG) {
    graphSVG.setAttribute("width", graphWrapper.getBoundingClientRect().width);
    graphSVG.setAttribute("height", window.innerHeight * 0.8);
    graphWrapper.setAttribute("height", window.innerHeight * 0.8);
  }

  function onZoom(graphSVGGroup, nodeSVGGroup, linkSVGGroup, labelsSVGGroup) {
    const scale = d3.event.transform;
    graphSVGGroup.attr("transform", scale);

    let zoomLevel = scale.k;
    const zoomOrKeep = (value) => (zoomLevel >= 1 ? value / zoomLevel : value);

    const font = Math.max(Math.round(zoomOrKeep(FONT_SIZE)), 1);
    nodeSVGGroup.attr("r", zoomOrKeep(RADIUS));
    linkSVGGroup.attr("stroke-width", zoomOrKeep(STROKE));
    labelsSVGGroup
        .attr("font-size", `${font}px`)
        .attr("y", (d) => d.y - zoomOrKeep(FONT_BASELINE));
  }

  function onClick(node) {
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
