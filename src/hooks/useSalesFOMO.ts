import { useState, useEffect } from 'react';

export interface SalesRecord {
  id: string;
  name: string;
  course: string;
  timeAgo: string;
  avatarUrl: string;
}

// 20 Mẫu Data Seeding Ảo (Sẽ thay bằng Sheets sau)
const MOCK_DATA: SalesRecord[] = [
  { id: '1', name: 'Nguyễn Văn Hải', course: 'AI Masterclass: ChatGPT & Midjourney', timeAgo: '2 phút trước', avatarUrl: 'https://i.pravatar.cc/150?u=hai' },
  { id: '2', name: 'Trần Thị Thu Thảo', course: 'Web Development với React & Node', timeAgo: '5 phút trước', avatarUrl: 'https://i.pravatar.cc/150?u=thao' },
  { id: '3', name: 'Lê Hoàng Anh', course: 'Kinh doanh thực chiến trên TikTok', timeAgo: '12 phút trước', avatarUrl: 'https://i.pravatar.cc/150?u=anh' },
  { id: '4', name: 'Phạm Minh Tuấn', course: 'AI Masterclass: ChatGPT & Midjourney', timeAgo: '15 phút trước', avatarUrl: 'https://i.pravatar.cc/150?u=tuan' },
  { id: '5', name: 'Hoàng Ngọc Yến', course: 'Khóa học VIP Member 1 Năm', timeAgo: '20 phút trước', avatarUrl: 'https://i.pravatar.cc/150?u=yen' },
  { id: '6', name: 'Vũ Đức Thành', course: 'Xây dựng thương hiệu cá nhân', timeAgo: '22 phút trước', avatarUrl: 'https://i.pravatar.cc/150?u=thanh' },
  { id: '7', name: 'Đặng Mai Phương', course: 'Web Development với React & Node', timeAgo: '25 phút trước', avatarUrl: 'https://i.pravatar.cc/150?u=phuong' },
  { id: '8', name: 'Bùi Quang Đạt', course: 'AI Masterclass: ChatGPT & Midjourney', timeAgo: '30 phút trước', avatarUrl: 'https://i.pravatar.cc/150?u=dat' },
  { id: '9', name: 'Hồ Tuấn Kiệt', course: 'Phân tích dữ liệu với Python', timeAgo: '45 phút trước', avatarUrl: 'https://i.pravatar.cc/150?u=kiet' },
  { id: '10', name: 'Lâm Thanh Trúc', course: 'Khóa học VIP Member 1 Năm', timeAgo: '1 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=truc' },
  { id: '11', name: 'Ngô Việt Hùng', course: 'Kinh doanh thực chiến trên TikTok', timeAgo: '1 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=hung' },
  { id: '12', name: 'Đỗ Thùy Trang', course: 'AI Masterclass: ChatGPT & Midjourney', timeAgo: '2 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=trang' },
  { id: '13', name: 'Trịnh Quốc Bảo', course: 'Web Development với React & Node', timeAgo: '2 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=bao' },
  { id: '14', name: 'Đinh Hà My', course: 'Thiết kế đồ họa với Canva & AI', timeAgo: '3 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=my' },
  { id: '15', name: 'Lương Tấn Phát', course: 'AI Masterclass: ChatGPT & Midjourney', timeAgo: '3 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=phat' },
  { id: '16', name: 'Chu Bảo Ngọc', course: 'Ngôn ngữ Anh giao tiếp chuyên nghiệp', timeAgo: '4 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=ngoc' },
  { id: '17', name: 'Thạch Kim Liên', course: 'Khóa học VIP Member 1 Năm', timeAgo: '5 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=lien' },
  { id: '18', name: 'Dương Thành Danh', course: 'AI Masterclass: ChatGPT & Midjourney', timeAgo: '12 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=danh' },
  { id: '19', name: 'Phan Minh Chí', course: 'Phân tích dữ liệu với Python', timeAgo: '16 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=chi' },
  { id: '20', name: 'Lý Kim Phụng', course: 'Xây dựng thương hiệu cá nhân', timeAgo: '1 ngày trước', avatarUrl: 'https://i.pravatar.cc/150?u=phung' },
];

export const useSalesFOMO = () => {
  const [currentNotification, setCurrentNotification] = useState<SalesRecord | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Popup lifecycle: Visible for 5s, Hidden for random 8-15s
    const showNextNotification = () => {
      // Pick a random record
      const randomRecord = MOCK_DATA[Math.floor(Math.random() * MOCK_DATA.length)];
      setCurrentNotification(randomRecord);
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
        
        // Schedule next popup after 8 to 15 seconds
        const nextDelay = Math.floor(Math.random() * (15000 - 8000 + 1) + 8000);
        setTimeout(showNextNotification, nextDelay);
      }, 5000);
    };

    // Initial delay before first popup (3 seconds)
    const initialTimer = setTimeout(showNextNotification, 3000);

    return () => {
      clearTimeout(initialTimer);
    };
  }, []);

  return { currentNotification, isVisible };
};
