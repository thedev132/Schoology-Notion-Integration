const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');
const util = require('./util.js')

const schoologyHeaders = {
    "Host": "api.schoology.com",
    "Content-Type": "application/json",
    "Authorization": `OAuth realm="Schoology API", oauth_consumer_key="${process.env.SCHOOLOGY_CONSUMER_KEY}", oauth_token="", oauth_nonce="${uuidv4()}", oauth_timestamp="${Math.floor(Date.now() / 1000).toString()}", oauth_signature_method="PLAINTEXT", oauth_version="1.0", oauth_signature="${process.env.SCHOOLOGY_CONSUMER_SECRET}%26"`,
}

async function getAllUsers() {
    const data = axios.get(`https://api.schoology.com/v1/users?start=0&limit=200`, {
        headers: schoologyHeaders
    }).then(res => {
        return res.data.user;
    }).catch(err => {
        console.error(err);
    })
    return data;
}

async function getUser(userID) {
    const data = axios.get(`https://api.schoology.com/v1/users/${userID}`, {
        headers: schoologyHeaders
    }).then(res => {
        return res.data;
    }).catch(err => {
        console.error(err);
    })
    return data;
}

async function getUserEvents(userID) {
    // get a date range of 7 days from today
    const today = util.getISODate("2022-02-07")
    const nextWeek = util.addDaysToDate(today, 7);

    // get the events for the user that fall in that date range
    const data = axios.get(`https://api.schoology.com/v1/users/${userID}/events?start_date=${today}&end_date=${nextWeek}&start=0&limit=200`, {
        headers: schoologyHeaders
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
    getUserEvents
}