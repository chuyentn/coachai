import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface TeacherStats {
  totalStudents: number;
  publishedCourses: number;
  draftCourses: number;
  monthlyRevenue: number;
  payoutBalance: number;
  courses: any[];
  loading: boolean;
  error: string | null;
}

/**
 * useTeacherStats – real-time Firestore hook for Teacher Dashboard metrics.
 * Queries: courses (by teacherId), enrollments (by courseIds), payments (by teacher_id).
 *
 * @param teacherId - Profile UID of the authenticated teacher
 */
export function useTeacherStats(teacherId: string | undefined): TeacherStats {
  const [state, setState] = useState<TeacherStats>({
    totalStudents: 0,
    publishedCourses: 0,
    draftCourses: 0,
    monthlyRevenue: 0,
    payoutBalance: 0,
    courses: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!teacherId) return;

    let cancelled = false;

    const fetch = async () => {
      setState(s => ({ ...s, loading: true, error: null }));
      try {
        // ── 1. Courses ────────────────────────────────────────────────
        const coursesSnap = await getDocs(
          query(collection(db, 'courses'), where('teacherId', '==', teacherId))
        );
        const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        const published = courses.filter((c: any) => c.status === 'published');
        const drafts = courses.filter((c: any) => c.status !== 'published');

        // ── 2. Enrollments ────────────────────────────────────────────
        let totalStudents = 0;
        if (courses.length > 0) {
          const courseIds = courses.map((c: any) => c.id).slice(0, 30); // Firestore 'in' limit
          const enrollSnap = await getDocs(
            query(collection(db, 'enrollments'), where('courseId', 'in', courseIds))
          );
          totalStudents = enrollSnap.size;
        }

        // ── 3. Payments ────────────────────────────────────────────────
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const paymentsSnap = await getDocs(
          query(
            collection(db, 'payments'),
            where('teacher_id', '==', teacherId),
            where('status', '==', 'completed')
          )
        );

        let totalRev = 0;
        let monthRev = 0;
        paymentsSnap.docs.forEach(d => {
          const p = d.data() as any;
          const amount = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0;
          totalRev += amount;
          const createdAt = p.created_at?.toDate?.();
          if (createdAt && createdAt >= startOfMonth) monthRev += amount;
        });

        // Teacher gets 70% after 30% platform cut
        const TEACHER_SHARE = 0.70;

        if (!cancelled) {
          setState({
            totalStudents,
            publishedCourses: published.length,
            draftCourses: drafts.length,
            monthlyRevenue: Math.round(monthRev * TEACHER_SHARE),
            payoutBalance: Math.round(totalRev * TEACHER_SHARE),
            courses,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          console.warn('[useTeacherStats] Firestore error:', err?.message);
          setState(s => ({ ...s, loading: false, error: err?.message || 'Lỗi tải dữ liệu' }));
        }
      }
    };

    fetch();

    return () => { cancelled = true; };
  }, [teacherId]);

  return state;
}
