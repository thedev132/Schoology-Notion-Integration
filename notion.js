const { Client } = require('@notionhq/client');
const util = require("./util.js");
const schoology = require("./schoology.js");

const notion = new Client({
    auth: process.env.NOTION_TOKEN
});

/** Get tasks and deadlines in the master database that are within a 7 day range by default
 * @param {string} startDate ISO 8601 date string of the date to start the search from
 * @param {string} endDate ISO 8601 date string of the date to end the search at
 * @returns {{Notion Page Resp}[]} Array of Notion pages that are in the master database and are within the given date range
 */
async function getEntries(startDate = util.getISODate(), endDate = util.addDaysToDate(startDate, 30)) {
    const response = await notion.databases.query({
        database_id: process.env.NOTION_MASTER_DATABASE_ID,
        filter: {
            and: [
                {
                    property: "Date",
                    date: {
                        on_or_after: startDate,
                    }
                },
                {
                    property: "Date",
                    date: {
                        on_or_before: endDate,
                    },
                },
            ]
        },
    })
    return response.results;
}

/**
 * Get a list of all the courses in the projects database
 * @returns {{Notion Page Resp}[]} Array of Notion pages that have the tag "Course" from the Notion API
 */
async function getCourseProjects() {
    // get page IDs from Projects db
    const response = await notion.databases.query({
        database_id: process.env.NOTION_PROJECTS_DATABASE_ID,
        filter: {
            property: "Tags",
            multi_select: {
                contains: "Course",
            },
        },
    })
    return response.results;
}

async function getCourseProjectIDs() {
    let courseProjectIDs = [];
    let courseProjects = await getCourseProjects();
    for (course in courseProjects) {
        courseProjectIDs.push(courseProjects[course].properties.Id.rich_text[0].plain_text);
    }
    // courseProjects.forEach((course) => {
    //     courseProjectIDs.push(course.properties.Id);
    // })
    return courseProjectIDs;
}

async function updateCourseProjectGrade(courseProjectIDs) {
    // update grade in Courses db. repeat the same process for all courses using the ids to match
    let grades = await schoology.getGrades(process.env.SCHOOLOGY_USER_ID)
    let gradeSections = grades.section;
    for (grade in gradeSections) {
        for (id in courseProjectIDs) {
            if (gradeSections[grade].section_id == `${courseProjectIDs[id]}`) {
                let letterGrade = ""
                let finalGrade = `(${gradeSections[grade].final_grade[0].grade}%)`
                //get the course by its Id property and update the grade
                const response = await notion.databases.query({
                    database_id: process.env.NOTION_PROJECTS_DATABASE_ID,
                    filter: {
                        property: "Id",
                        text: {
                            equals: courseProjectIDs[id],
                        }
                    }
                })
                // update the grade
                // find the letter grade equivalent
                if (gradeSections[grade].final_grade[0].grade == null) {
                    letterGrade = "N/A"
                }
                else if (gradeSections[grade].final_grade[0].grade >= 90) {
                    letterGrade = "A"
                }
                else if (gradeSections[grade].final_grade[0].grade >= 80) {
                    letterGrade = "B"
                }
                else if (gradeSections[grade].final_grade[0].grade >= 70) {
                    letterGrade = "C"
                }
                else if (gradeSections[grade].final_grade[0].grade >= 60) {
                    letterGrade = "D"
                }
                else if (gradeSections[grade].final_grade[0].grade < 60) {
                    letterGrade = "F"
                }


                if (gradeSections[grade].final_grade[0].grade == null) {
                    finalGrade = ""
                }
                // update the grade
                await notion.pages.update({
                    page_id: response.results[0].id,
                    properties: {
                        Grade: {
                            rich_text: [
                                {
                                  "type": "text",
                                  "text": {
                                    "content": `${letterGrade} ${finalGrade}`
                                  }
                                }
                              ]
                        }
                    }
                })

            }
        }
    
    }
}

/**
 * Get a list of databases that the integration has access to
 * @returns {Promise<{Notion Database Resp}[]>} Array of Notion databases that are shared with the integration
 */
function getDatabases() {
    return notion.search({
        filter: {
            property: "object",
            value: "database"
        }
    })
}

module.exports = {
    getEntries,
    getCourseProjects,
    getDatabases,
    getCourseProjectIDs,
    updateCourseProjectGrade
}