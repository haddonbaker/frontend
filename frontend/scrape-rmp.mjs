// scrape-rmp.mjs
// Run once with: node scrape-rmp.mjs
import { writeFileSync } from "fs";

const SCHOOL_ID = "U2Nob29sLTM4NA=="; // Base64 of "School-384"

async function fetchProfessors(schoolId) {
  let professors = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = `
      query TeacherSearchPaginationQuery($count: Int!, $cursor: String, $query: TeacherSearchQuery!) {
        search: newSearch {
          teachers(query: $query, first: $count, after: $cursor) {
            pageInfo { hasNextPage, endCursor }
            edges {
              node {
                id
                firstName
                lastName
                department
                avgRating
                avgDifficulty
                numRatings
                wouldTakeAgainPercent
                teacherRatingTags { tagName tagCount }
                ratings(first: 5) {
                  edges {
                    node {
                      comment
                      qualityRating
                      difficultyRatingRounded
                      class
                      date
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      count: 50,
      cursor: cursor,
      query: { schoolID: schoolId, text: "" },
    };

    const res = await fetch("https://www.ratemyprofessors.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic dGVzdDp0ZXN0", // RMP's public auth header
        Referer: "https://www.ratemyprofessors.com/",
        Origin: "https://www.ratemyprofessors.com",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();
    const teacherData = json?.data?.search?.teachers;

    if (!teacherData) {
      console.error("Unexpected response:", JSON.stringify(json, null, 2));
      break;
    }

    const nodes = teacherData.edges.map((e) => e.node);
    professors = professors.concat(nodes);
    hasNextPage = teacherData.pageInfo.hasNextPage;
    cursor = teacherData.pageInfo.endCursor;

    console.log(`Fetched ${professors.length} professors so far...`);
  }

  return professors;
}

const data = await fetchProfessors(SCHOOL_ID);

// Clean and reshape
const cleaned = data.map((p) => ({
  id: p.id,
  name: `${p.firstName} ${p.lastName}`,
  department: p.department,
  rating: p.avgRating,
  difficulty: p.avgDifficulty,
  numRatings: p.numRatings,
  wouldTakeAgain: p.wouldTakeAgainPercent,
  tags: p.teacherRatingTags?.map((t) => t.tagName) ?? [],
  recentReviews:
    p.ratings?.edges?.map((e) => ({
      comment: e.node.comment,
      quality: e.node.qualityRating,
      difficulty: e.node.difficultyRatingRounded,
      course: e.node.class,
      date: e.node.date,
    })) ?? [],
}));

writeFileSync("src/data/professors.json", JSON.stringify(cleaned, null, 2));
console.log(`✅ Done! Saved ${cleaned.length} professors to src/data/professors.json`);