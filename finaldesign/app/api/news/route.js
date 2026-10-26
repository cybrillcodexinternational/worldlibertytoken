import { NextResponse } from "next/server";

const NEWS = [
  {
    source: "Announcements",
    publishedAt: "2026-09-13T00:00:00.000Z",
    title: "Robotics Research: Ideas Shaping Intelligent Systems",
    description:
      "Explore current themes in robotics, automation, and connected technologies through clear research summaries and learning resources.",
    image: "/images/featured-robot-coin.png",
    url: "/news",
  },
  {
    source: "Ecosystem",
    publishedAt: "2026-08-28T00:00:00.000Z",
    title: "How Robots Sense And Respond To The World",
    description:
      "An introduction to sensing technologies and the systems that help robots interpret their surroundings.",
    image: "/images/echosystem.png",
    url: "/news",
  },
  {
    source: "Research",
    publishedAt: "2026-08-22T00:00:00.000Z",
    title: "Understanding Robotics And Automation",
    description:
      "A practical guide to robotic platforms, automated workflows, and the technologies that connect them.",
    image: "/images/featured-robot-coin.png",
    url: "/news",
  },
  {
    source: "Guides",
    publishedAt: "2026-08-18T00:00:00.000Z",
    title: "A Guide To Human-Robot Interaction",
    description:
      "Explore the principles behind safe, accessible, and effective collaboration between people and machines.",
    image: "/images/echosystem5.png",
    url: "/news",
  },
  {
    source: "Partnerships",
    publishedAt: "2026-08-14T00:00:00.000Z",
    title: "Why Responsible Robotics Design Matters",
    description:
      "Consider safety, privacy, accessibility, and real-world impact when developing intelligent systems.",
    image: "/images/patnershipfinal.jpeg",
    url: "/news",
  },
  {
    source: "Community",
    publishedAt: "2026-08-10T00:00:00.000Z",
    title: "Robotics Research Starts With Good Questions",
    description:
      "See how curiosity and clear research questions help explain complex technologies and their possible uses.",
    image: "/images/moon.jpeg",
    url: "/news",
  },
  {
    source: "Industry",
    publishedAt: "2026-08-05T00:00:00.000Z",
    title: "Connected Devices And Intelligent Networks",
    description:
      "Learn how connected devices exchange information and what that means for modern robotic systems.",
    image: "/images/echosystem.png",
    url: "/news",
  },
];

export async function GET(request) {
  const requestedPageSize = Number(
    new URL(request.url).searchParams.get("pageSize") || 3
  );
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.min(Math.max(Math.floor(requestedPageSize), 1), NEWS.length)
    : 3;

  return NextResponse.json({
    success: true,
    articles: NEWS.slice(0, pageSize),
  });
}
