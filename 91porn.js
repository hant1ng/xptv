//1.0
const cheerio = createCheerio();

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

let appConfig = {
  ver: 1,
  title: "91porn",
  site: "https://91porn.com/index.php",
  tabs: [
    { name: "原创", ext: { url: "https://91porn.com/v.php?category=ori&viewtype=basic" } },
    { name: "热门", ext: { url: "https://91porn.com/v.php?category=hot&viewtype=basic" } },
    { name: "排行榜", ext: { url: "https://91porn.com/v.php?category=top&viewtype=basic" } },
    { name: "长片", ext: { url: "https://91porn.com/v.php?category=long&viewtype=basic" } },
    { name: "超长", ext: { url: "https://91porn.com/v.php?category=longer&viewtype=basic" } },
    { name: "TF", ext: { url: "https://91porn.com/v.php?category=tf&viewtype=basic" } },
    { name: "RF", ext: { url: "https://91porn.com/v.php?category=rf&viewtype=basic" } },
    { name: "Top月", ext: { url: "https://91porn.com/v.php?category=top&m=-1&viewtype=basic" } },
    { name: "MF", ext: { url: "https://91porn.com/v.php?category=mf&viewtype=basic" } }
  ]
};

async function getConfig() {
  return jsonify(appConfig);
}

async function getCards(ext) {
  ext = argsify(ext);
  let { page = 1, url } = ext;

  if (page > 1) {
    url += `&page=${page}`;
  }

  const { data } = await $fetch.get(url, {
    headers: { "User-Agent": UA }
  });

  const $ = cheerio.load(data);
  let cards = [];

  $(".col-xs-12.col-sm-4.col-md-3.col-lg-3").each((_, element) => {
    const aTag = $(element).find("a");
    const href = aTag.attr("href");
    const title = aTag.find(".video-title").text().trim();
    const cover = aTag.find("img").attr("src");
    const duration = aTag.find(".duration").text().trim();

    cards.push({
      vod_id: href,
      vod_name: title,
      vod_pic: cover,
      vod_remarks: duration,
      ext: { url: href }
    });
  });

  return jsonify({ list: cards });
}

async function getTracks(ext) {
  ext = argsify(ext);
  const url = ext.url;

  const { data } = await $fetch.get(url, {
    headers: { "User-Agent": UA }
  });

  const $ = cheerio.load(data);
  let mp4Url = $("video source").attr("src") || $("video").attr("src");

  if (!mp4Url && data.includes(".mp4")) {
    // 万一 source 标签没有，直接匹配 mp4 链接
    let match = data.match(/https?:\/\/.*?\.mp4\?[^"'\s]+/);
    if (match) mp4Url = match[0];
  }

  let tracks = [];
  if (mp4Url) {
    tracks.push({
      name: "播放",
      pan: "",
      ext: { url: mp4Url }
    });
  }

  return jsonify({
    list: [
      {
        title: "默认分组",
        tracks
      }
    ]
  });
}

async function getPlayinfo(ext) {
  ext = argsify(ext);
  const url = ext.url;

  return jsonify({ urls: [url], headers: [{ "User-Agent": UA }] });
}

// 不支持搜索
async function search(ext) {
  return jsonify({ list: [] });
}
