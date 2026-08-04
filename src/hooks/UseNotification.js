import { useEffect }    from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../store/slices/notificationSlice';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { items, unread, loading } = useSelector(s => s.notifications);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  const markRead    = (id)  => dispatch(markNotificationRead(id));
  const markAllRead = ()    => dispatch(markAllNotificationsRead());

  return { items, unread, loading, markRead, markAllRead };
};