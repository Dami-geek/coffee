import { useEffect, useRef } from "react";
import * as d3 from "d3";

export type FlavorNode = {
  name: string;
  color?: string;
  children?: FlavorNode[];
  value?: number;
};

const flavorData: FlavorNode = {
  name: "Flavor",
  children: [
    {
      name: "Fruity",
      color: "#da1d23",
      children: [
        {
          name: "Berry",
          color: "#b04238",
          children: [
            { name: "Blackberry", color: "#3e0317", value: 1 },
            { name: "Raspberry", color: "#e52968", value: 1 },
            { name: "Blueberry", color: "#6469b0", value: 1 },
            { name: "Strawberry", color: "#ef2d36", value: 1 },
          ],
        },
        {
          name: "Other fruit",
          color: "#f36f20",
          children: [
            { name: "Peach", color: "#f89a80", value: 1 },
            { name: "Apple", color: "#4ebc45", value: 1 },
          ],
        },
        {
          name: "Citrus fruit",
          color: "#f89a80",
          children: [
            { name: "Grapefruit", color: "#f2684b", value: 1 },
            { name: "Orange", color: "#f7a128", value: 1 },
            { name: "Lemon", color: "#f6d634", value: 1 },
            { name: "Lime", color: "#8bca51", value: 1 },
            { name: "Bergamot", color: "#f6d634", value: 1 },
          ],
        },
      ],
    },
    {
      name: "Floral",
      color: "#e11890",
      children: [
        {
          name: "Floral",
          color: "#e11890",
          children: [
            { name: "Jasmine", color: "#ffffff", value: 1 },
            { name: "Rose", color: "#f0a8c2", value: 1 },
          ],
        },
        {
          name: "Black Tea",
          color: "#894a43",
          value: 1,
        },
      ],
    },
    {
      name: "Sweet",
      color: "#e55831",
      children: [
        {
          name: "Brown sugar",
          color: "#d45a59",
          children: [
            { name: "Molasses", color: "#310d0f", value: 1 },
            { name: "Caramel", color: "#c86b28", value: 1 },
            { name: "Honey", color: "#d28e46", value: 1 },
          ],
        },
        { name: "Vanilla", color: "#f89a80", value: 1 },
      ],
    },
    {
      name: "Nutty/Cocoa",
      color: "#a77d5d",
      children: [
        {
          name: "Nutty",
          color: "#c39a6b",
          children: [
            { name: "Peanuts", color: "#d4ad68", value: 1 },
            { name: "Hazelnut", color: "#a5723b", value: 1 },
            { name: "Almond", color: "#d4b37f", value: 1 },
          ],
        },
        {
          name: "Cocoa",
          color: "#8c4c34",
          children: [
            { name: "Chocolate", color: "#74462e", value: 1 },
            { name: "Dark chocolate", color: "#472718", value: 1 },
          ],
        },
      ],
    },
    {
      name: "Spices",
      color: "#a83c51",
      children: [
        { name: "Brown spice", color: "#9e4242", value: 1 },
        { name: "Pepper", color: "#cc3d41", value: 1 },
      ],
    },
  ],
};

export default function FlavorWheel({
  highlightedNotes,
  onFlavorClick,
  className,
}: {
  highlightedNotes: string[];
  onFlavorClick?: (flavor: string) => void;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onFlavorClickRef = useRef(onFlavorClick);

  useEffect(() => {
    onFlavorClickRef.current = onFlavorClick;
  }, [onFlavorClick]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const partition = d3.partition<FlavorNode>().size([2 * Math.PI, radius]);

    const root = d3
      .hierarchy(flavorData)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    partition(root);

    const arc = d3
      .arc<d3.HierarchyRectangularNode<FlavorNode>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle(0.005)
      .padRadius(radius / 2)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1 - 1);

    // Helper to check if a node or its descendants are highlighted
    const isHighlighted = (node: d3.HierarchyRectangularNode<FlavorNode>): boolean => {
      if (highlightedNotes.length === 0) return true; // If none highlighted, show all
      const nameLower = node.data.name.toLowerCase();
      if (highlightedNotes.some((n) => n.toLowerCase() === nameLower)) return true;
      if (node.children) {
        return node.children.some(isHighlighted);
      }
      return false;
    };

    g.selectAll("path")
      .data(root.descendants().filter((d) => d.depth > 0))
      .enter()
      .append("path")
      .attr("d", arc)
      .style("fill", (d) => {
        let current: d3.HierarchyRectangularNode<FlavorNode> | null = d;
        while (current && current.depth > 1) current = current.parent;
        return d.data.color || current?.data.color || "#ccc";
      })
      .style("opacity", (d) => {
        if (highlightedNotes.length === 0) return 1;
        return isHighlighted(d) ? 1 : 0.15;
      })
      .style("stroke", "#fff")
      .style("stroke-width", "1px")
      .style("transition", "opacity 0.2s, stroke-width 0.2s")
      .style("cursor", onFlavorClick ? "pointer" : "default")
      .on("mouseover", function () {
        d3.select(this)
          .style("opacity", 1)
          .style("stroke", "#000")
          .style("stroke-width", "2px");
      })
      .on("mouseout", function (_event, d) {
        d3.select(this)
          .style("opacity", () => {
            if (highlightedNotes.length === 0) return 1;
            return isHighlighted(d) ? 1 : 0.15;
          })
          .style("stroke", "#fff")
          .style("stroke-width", "1px");
      })
      .on("click", function (_event, d) {
        if (onFlavorClickRef.current) {
          onFlavorClickRef.current(d.data.name);
        }
      })
      .append("title")
      .text((d) => d.data.name);

    g.selectAll("text")
      .data(root.descendants().filter((d) => d.depth > 0 && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
      .enter()
      .append("text")
      .attr("transform", function (d) {
        const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
        const y = (d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.35em")
      .text((d) => d.data.name)
      .style("font-size", "9px")
      .style("fill", () => {
        // Simple contrast check
        return "#fff"; // Most of these colors are dark enough
      })
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .style("opacity", (d) => {
        if (highlightedNotes.length === 0) return 1;
        return isHighlighted(d) ? 1 : 0;
      });
  }, [highlightedNotes]);

  return (
    <div ref={containerRef} className={className}>
      <svg ref={svgRef} viewBox="0 0 400 400" className="h-full w-full" />
    </div>
  );
}
