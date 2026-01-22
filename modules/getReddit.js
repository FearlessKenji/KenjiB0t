async function getLatestPost(subName) {
  const res = await fetch(
    `https://www.reddit.com/r/${subName}/new.json?limit=1`,
    { headers: { 'User-Agent': 'Mendicant Bias' } }
  );

  const json = await res.json();
  return json.data.children[0]?.data ?? null;
}

async function getSubredditInfo(subName) {
  const res = await fetch(
    `https://www.reddit.com/r/${subName}/about.json`,
    { headers: { 'User-Agent': 'Mendicant Bias' } }
  );

  const json = await res.json();
  const data = json.data;

  // Prefer community_icon, fallback to icon_img
  const icon =
    (data.community_icon && data.community_icon.split('?')[0]) ||
    data.icon_img ||
    null;

  return { icon };
}

module.exports = { getLatestPost, getSubredditInfo };
