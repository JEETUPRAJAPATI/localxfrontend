// pages/api/revalidate.js
export default async function handler(req, res) {
    if (req.query.secret !== process.env.REVALIDATE_SECRET) {
        return res.status(401).json({ message: 'Invalid secret' });
    }

    try {
        // Revalidate the homepage
        await res.revalidate('/');

        // Revalidate a specific url
        if (req?.query?.site_url && req?.query?.site_url !== '/') {
            await res.revalidate(`/${req.query.site_url}`);
        }

        // Revalidate a specific post (e.g., /posts/post-1)
        if (req.query.slug) {
            await res.revalidate(`/posts/${req.query.slug}`);
        }
        return res.json({ revalidated: true });
    } catch (error) {
        return res.status(500).json({ message: 'Revalidation failed', error });
    }
}

// curl https://localxlist.org/api/revalidate?secret=revalidate-token&slug=post-1
// curl https://localxlist.org/api/revalidate?secret=revalidate-token&site_url=s/united-states/illinois/bloomington-normal