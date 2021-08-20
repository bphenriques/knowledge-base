{{ $graphData := resources.Get "graph_generator/graph-data.json" | resources.ExecuteAsTemplate "graph-data.json" . | resources.Minify | resources.Fingerprint }}

(function () {
  const RADIUS = 4;
  const STROKE = 1;
  const FONT_SIZE = 15;
  const TICKS = 100;
  const FONT_BASELINE = 15;
  const MAX_LABEL_LENGTH = 50;

  const graphDataURL = '{{ $graphData.RelPermalink }}';

  // TODO: Replace with a different hook
  const graphWrapper = document.getElementById('graph-wrapper')
  const input = document.querySelector('#book-search-input');
  const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  if (!input) {
    return
  }

  input.addEventListener('focus', init);
  function init() {
    input.removeEventListener('focus', init); // init once
    alert("init!")

    fetch(graphDataURL)
      .then(pages => pages.json())
      .then(graphData => {
        let nodesData = graphData.nodes;
        let linksData = graphData.edges;

        initGraph(nodesData, linksData)
      });
  }

  function initGraph(nodesData, linksData) {
    const element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    const graphWrapper = document.getElementById('graph-wrapper')

    element.setAttribute("width", graphWrapper.getBoundingClientRect().width);
    graphWrapper.setAttribute("height", window.innerHeight * 0.8);
    element.setAttribute("height", window.innerHeight * 0.8);

    graphWrapper.appendChild(element);

    const reportWindowSize = () => {
      element.setAttribute("width", graphWrapper.getBoundingClientRect().width);
      graphWrapper.setAttribute("height", window.innerHeight * 0.8);
      element.setAttribute("height", window.innerHeight * 0.8);
    };

    window.onresize = reportWindowSize;

    const svg = d3.select("svg");
    const width = Number(svg.attr("width"));
    const height = Number(svg.attr("height"));
    let zoomLevel = 1;

    const simulation = d3
      .forceSimulation(nodesData)
      .force("charge", d3
        .forceManyBody()
        .strength(-4000)
      )
      .force(
        "link",
        d3
          .forceLink(linksData)
          .id((d) => d.id)
          .distance(150)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .stop();

    const g = svg.append("g");
    let link = g.append("g").attr("class", "links").selectAll(".link");
    let node = g.append("g").attr("class", "nodes").selectAll(".node");
    let text = g.append("g").attr("class", "text").selectAll(".text");

    const zoomActions = () => {
      const scale = d3.event.transform;
      zoomLevel = scale.k;
      g.attr("transform", scale);

      const zoomOrKeep = (value) => (scale.k >= 1 ? value / scale.k : value);

      const font = Math.max(Math.round(zoomOrKeep(FONT_SIZE)), 1);

      text.attr("font-size", `${font}px`);
      text.attr("y", (d) => d.y - zoomOrKeep(FONT_BASELINE));
      link.attr("stroke-width", zoomOrKeep(STROKE));
      node.attr("r", zoomOrKeep(RADIUS));
    };

    const ticked = () => {
      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      text
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y - FONT_BASELINE / zoomLevel);
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
    };

    const restart = () => {
      node = node.data(nodesData, (d) => d.id);
      node.exit().remove();
      node = node
        .enter()
        .append("circle")
        .attr("r", RADIUS)
        // .attr("fill", (d) => getNodeColor(d))
        .on("click", onClick)
        .merge(node);

      link = link.data(linksData, (d) => `${d.source.id}-${d.target.id}`);
      link.exit().remove();
      link = link
        .enter()
        .append("line")
        .attr("stroke-width", STROKE)
        .merge(link);

      node.attr("active", (d) => isCurrentPath(d.path) ? true : null);
      text.attr("active", (d) => isCurrentPath(d.path) ? true : null);

      text = text.data(nodesData, (d) => d.label);
      text.exit().remove();
      text = text
        .enter()
        .append("text")
        .text((d) => shorten(d.label.replace(/_*/g, ""), MAX_LABEL_LENGTH))
        .attr("font-size", `${FONT_SIZE}px`)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .on("click", onClick)
        .merge(text);

      simulation.nodes(nodesData);
      simulation.force("link").links(linksData);
      simulation.alpha(1).restart();
      simulation.stop();

      for (let i = 0; i < TICKS; i++) {
        simulation.tick();
      }

      ticked();
    };

    const zoomHandler = d3
      .zoom()
      .scaleExtent([0.2, 3])
      //.translateExtent([[0,0], [width, height]])
      //.extent([[0, 0], [width, height]])
      .on("zoom", zoomActions);

    zoomHandler(svg);
    restart();
  }

  function onClick(d) {
    window.location = d.path
  }

  function isCurrentPath(notePath) {
    return window.location.pathname.includes(notePath)
  }

  function shorten(str, maxLen, separator = ' ') {
    if (str.length <= maxLen) return str;
    return str.substr(0, str.lastIndexOf(separator, maxLen)) + '...';
  }

})();
