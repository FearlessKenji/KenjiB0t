async function getData(channelName, clientID, authKey) {
    const url = `https://api.twitch.tv/helix/streams?user_login=${channelName}`;
    const headers = {
        'Client-Id': clientID,
        'Authorization': `Bearer ${authKey}`,
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = { getData };