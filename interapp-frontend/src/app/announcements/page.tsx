'use client';
import APIClient from '@api/api_client';
import AnnouncementBox from './AnnouncementBox/AnnouncementBox';
import PageController from '@components/PageController/PageController';
import { AnnouncementWithMeta } from './types';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { remapAssetUrl } from '@/api/utils';
import './styles.css';

const handleFetch = async (page: number) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.get('/announcement/all', { params: { page: page, page_size: 10 } });
  if (res.status !== 200) throw new Error('Failed to fetch announcements');

  const resData: {
    data: AnnouncementWithMeta[];
    total_entries: number;
    length_of_page: number;
  } = res.data;
  resData.data = resData.data.map((announcement) => {
    announcement.announcement_attachments = announcement.announcement_attachments.map(
      (attachment) => {
        attachment.attachment_loc = remapAssetUrl(attachment.attachment_loc);
        return attachment;
      },
    );
    if (announcement.image) announcement.image = remapAssetUrl(announcement.image);
    return announcement;
  });
  return resData;
};

type AllAnnouncements = Awaited<ReturnType<typeof handleFetch>>;

export default function AnnouncementsPage() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState<AllAnnouncements | null>(null);

  const [page, setPage] = useState(1);

  useEffect(() => {
    handleFetch(page).then((res) => setData(res));
  }, [page]);

  return (
    <div className='announcement-page'>
      <div className='announcement-cards-container'>
        {data?.data.map((announcement) => (
          <AnnouncementBox
            key={announcement.announcement_id}
            id={announcement.announcement_id}
            title={announcement.title}
            description={announcement.description}
            date={new Date(announcement.creation_date)}
            imageURL={announcement.image}
            completed={
              announcement.announcement_completions.find(
                (completion) => completion.username === user?.username,
              )?.completed ?? true
            }
          />
        ))}
      </div>
      <PageController
        activePage={page}
        totalPages={data ? Math.ceil(data?.total_entries / data?.length_of_page) : 1}
        handlePageChange={(page) => setPage(page)}
        className='announcement-page-controller'
      />
    </div>
  );
}
