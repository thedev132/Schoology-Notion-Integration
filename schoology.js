const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');
const util = require('./util.js')

function getHeaders() {
    return {
        "Host": "api.schoology.com",
        "Content-Type": "application/json",
        "Authorization": `OAuth realm="Schoology API", oauth_consumer_key="${process.env.SCHOOLOGY_CONSUMER_KEY}", oauth_token="", oauth_nonce="${uuidv4()}", oauth_timestamp="${Math.floor(Date.now() / 1000).toString()}", oauth_signature_method="PLAINTEXT", oauth_version="1.0", oauth_signature="${process.env.SCHOOLOGY_CONSUMER_SECRET}%26"`,
    }
}

async function getAllUsers() {
    const data = axios.get(`https://api.schoology.com/v1/users?start=0&limit=200`, {
        headers: getHeaders()
    }).then(res => {
        return res.data.user;
    }).catch(err => {
        console.error(err);
    })
    return data;
}

async function getUser(userID) {
    const data = axios.get(`https://api.schoology.com/v1/users/${userID}`, {
        headers: getHeaders()
    }).then(res => {
        return res.data;
    }).catch(err => {
        console.error(err);
    })
    return data;
}


// weird bug where 6.4 and 6.3 hws are showing up when the startDate is 2022-03-01 and the hw dates are 2022-02-28 (end of month) - schoology issue? filter to fix?
async function getUserEvents(userID, startDate = util.getISODate(), endDate = util.addDaysToDate(startDate, 30)) {
    // get the events for the user that fall in that date range
    const data = axios.get(`https://api.schoology.com/v1/users/${userID}/events?start_date=${startDate}&end_date=${endDate}&start=0&limit=30`, {
        headers: getHeaders()
    }).then(res => {
        return res.data.event;
    }).catch(err => {
        console.error(err);
    })
    return data;
}

function getCourseSection(sectionID) {
    const data = axios.get(`https://api.schoology.com/v1/sections/${sectionID}`, {
        headers: getHeaders()
    }).then(res => {
        return res.data;
    }).catch(err => {
        console.error(err);
    })
    return data;
}

//make a functionto get grades from schoology
function getGrades(userID, courseIDs) {
    const data = axios.get(`https://api.schoology.com/v1/users/${userID}/grades`, {
        headers: getHeaders()
    }).then(res => {
        return res.data;
    }).catch(err => {
        console.error(err);
    })
    
    return data;
}

module.exports = {
    getAllUsers,
    getUser,
    getUserEvents,
    getCourseSection,
    getGrades
}
