import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiUrl = process.env.ADMIN_API_URL || 'http://localhost:3000';
    const apiRes = await fetch(`${apiUrl}/notifications`);
    // console.log(apiRes,"this is response-6 api call")
    if (!apiRes.ok) {
      
      return res.status(apiRes.status).json({ error: 'Failed to fetch notifications' });
    }
    const data = await apiRes.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
