import React, { useEffect, useState } from 'react';
import { AdminLayout } from './Dashboard';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { MessageSquare, Star } from 'lucide-react';

export default function Feedback() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'restaurants', user.uid, 'feedback'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q,
      (snap) => {
        setFeedbacks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Feedback snapshot error:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : 0;

  return (
    <AdminLayout>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={28} color="var(--primary)" /> Guest Feedback
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Read what your customers are saying about their experience.</p>
        </div>
        
        {feedbacks.length > 0 && (
          <div style={{ background: 'var(--surface)', padding: '12px 24px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Average Rating</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {averageRating} <Star size={24} fill="#feca57" color="#feca57" style={{ marginTop: '-4px' }} />
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Reviews</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700' }}>{feedbacks.length}</div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading feedback...</div>
      ) : feedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <MessageSquare size={64} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>No Feedback Yet</h2>
          <p style={{ color: 'var(--text-muted)' }}>When guests submit feedback from the menu, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {feedbacks.map(f => {
            const date = f.createdAt?.toDate?.()?.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) || 'Just now';
            return (
              <div key={f.id} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={18} fill={f.rating >= star ? '#feca57' : 'transparent'} color={f.rating >= star ? '#feca57' : 'var(--border)'} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-color)', padding: '4px 10px', borderRadius: '50px', fontWeight: '600' }}>
                    Table {f.tableNumber || '?'}
                  </span>
                </div>
                
                {f.review ? (
                  <p style={{ fontSize: '1rem', lineHeight: '1.5', margin: 0 }}>"{f.review}"</p>
                ) : (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No written review provided.</p>
                )}
                
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  {date}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
