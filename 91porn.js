const cheerio = createCheerio();

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

let appConfig = {
    ver: 1,
    title: '91Porn',
    site: 'https://91porn.com/index.php',
};

async function getConfig() {
    let config = appConfig;
    config.tabs = await getTabs();
    return jsonify(config);
}

// 固定分类列表
async function getTabs() {
    const categories = [
        { name: '原创', url: 'https://91porn.com/v.php?category=ori&viewtype=basic' },
        { name: '热门', url: 'https://91porn.com/v.php?category=hot&viewtype=basic' },
        { name: '排行', url: 'https://91porn.com/v.php?category=top&viewtype=basic' },
        { name: '短片', url: 'https://91porn.com/v.php?category=long&viewtype=basic' },
        { name: '长片', url: 'https://91porn.com/v.php?category=longer&viewtype=basic' },
        { name: '自拍', url: 'https://91porn.com/v.php?category=tf&viewtype=basic' },
        { name: '女优', url: 'https://91porn.com/v.php?category=rf&viewtype=basic' },
        { name: '顶级', url: 'https://91porn.com/v.php?category=top&m=-1&viewtype=basic' },
        { name: '混合', url: 'https://91porn.com/v.php?category=mf&viewtype=basic' },
    ];

    return categories.map(c => ({ name: c.name, ext: { url: c.url } }));
}

async function getCards(ext) {
    ext = argsify(ext);
    let cards = [];
    let { page = 1, url } = ext;

    if (page > 1) {
        url += '&page=' + page;
    }

    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } });
    const $ = cheerio.load(data);

    $('.col-xs-12.col-sm-4.col-md-3.col-lg-3').each((_, element) => {
        const href = $(element).find('a').attr('href');
        const title = $(element).find('.video-title').text().trim();
        const cover = $(element).find('img').attr('src');
        const duration = $(element).find('.duration').text().trim();

        if (href) {
            cards.push({
                vod_id: href,
                vod_name: title,
                vod_pic: cover,
                vod_remarks: duration,
                ext: { url: href },
            });
        }
    });

    return jsonify({ list: cards });
}

// 点击视频进入播放页，返回播放页 URL
async function getTracks(ext) {
    ext = argsify(ext);
    let tracks = [];
    tracks.push({
        name: '播放',
        pan: '',
        ext: {
            url: ext.url,  // 返回播放页 URL，而非直接 MP4
        },
    });

    return jsonify({
        list: [
            {
                title: '默认分组',
                tracks,
            },
        ],
    });
}

// APP 播放时直接使用播放页
async function getPlayinfo(ext) {
    ext = argsify(ext);
    return jsonify({ urls: [ext.url] });
}
