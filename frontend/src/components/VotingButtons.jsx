import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VotingButtons({ complaint, onVoteChange, size = 'default' }) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(complaint?.upvotesCount || 0);
  const [downvotes, setDownvotes] = useState(complaint?.downvotesCount || 0);
  const [netScore, setNetScore] = useState(
    complaint?.netScore !== undefined ? complaint.netScore : (complaint?.upvotesCount || 0) - (complaint?.downvotesCount || 0)
  );
  const [userVote, setUserVote] = useState(complaint?.userVote || null);
  const [submitting, setSubmitting] = useState(false);
  const [voteError, setVoteError] = useState('');

  // Sync state if complaint prop changes
  React.useEffect(() => {
    setUpvotes(complaint?.upvotesCount || 0);
    setDownvotes(complaint?.downvotesCount || 0);
    setNetScore(
      complaint?.netScore !== undefined ? complaint.netScore : (complaint?.upvotesCount || 0) - (complaint?.downvotesCount || 0)
    );
    setUserVote(complaint?.userVote || null);
  }, [complaint]);

  const handleVote = async (type, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setVoteError('');

    if (!user) {
      setVoteError('Please sign in as a citizen to vote on civic issues.');
      return;
    }

    if (user.role !== 'citizen') {
      setVoteError('Municipal Authorities cannot cast votes. Voting is reserved for citizens.');
      return;
    }

    if (user.isSuspended && user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      setVoteError(`Your account is suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}. You cannot vote while suspended.`);
      return;
    }

    // Optimistic calculation
    const prevVote = userVote;
    const prevUp = upvotes;
    const prevDown = downvotes;
    const prevNet = netScore;

    let nextVote = null;
    let nextUp = upvotes;
    let nextDown = downvotes;

    if (prevVote === type) {
      // Toggle off
      nextVote = null;
      if (type === 'upvote') nextUp = Math.max(0, nextUp - 1);
      if (type === 'downvote') nextDown = Math.max(0, nextDown - 1);
    } else {
      nextVote = type;
      if (type === 'upvote') {
        nextUp = nextUp + 1;
        if (prevVote === 'downvote') nextDown = Math.max(0, nextDown - 1);
      } else {
        nextDown = nextDown + 1;
        if (prevVote === 'upvote') nextUp = Math.max(0, nextUp - 1);
      }
    }

    setUserVote(nextVote);
    setUpvotes(nextUp);
    setDownvotes(nextDown);
    setNetScore(nextUp - nextDown);
    setSubmitting(true);

    try {
      const res = await api.voteComplaint(complaint._id || complaint.referenceId, type);
      if (res.success) {
        setUserVote(res.userVote);
        setUpvotes(res.upvotesCount);
        setDownvotes(res.downvotesCount);
        setNetScore(res.netScore);
        if (onVoteChange) {
          onVoteChange({
            complaintId: complaint._id,
            upvotesCount: res.upvotesCount,
            downvotesCount: res.downvotesCount,
            netScore: res.netScore,
            userVote: res.userVote,
            autoRestored: res.autoRestored
          });
        }
      }
    } catch (err) {
      // Revert optimistic update
      setUserVote(prevVote);
      setUpvotes(prevUp);
      setDownvotes(prevDown);
      setNetScore(prevNet);
      setVoteError(err.message || 'Unable to record vote.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSmall = size === 'small';
  const iconSize = isSmall ? 13 : 15;
  const padding = isSmall ? '3px 8px' : '5px 12px';
  const fontSize = isSmall ? '0.75rem' : '0.8125rem';

  const isAuthority = user && ['authority', 'authority_admin', 'authority_category'].includes(user.role);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '2px 4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        {/* Upvote Button */}
        <button
          type="button"
          disabled={submitting || isAuthority}
          onClick={(e) => handleVote('upvote', e)}
          title={isAuthority ? 'Authorities cannot vote' : userVote === 'upvote' ? 'Remove Upvote' : 'Upvote this complaint'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding,
            border: 'none',
            borderRadius: '16px',
            backgroundColor: userVote === 'upvote' ? '#DCFCE7' : 'transparent',
            color: userVote === 'upvote' ? '#15803D' : 'var(--text-secondary)',
            fontWeight: userVote === 'upvote' ? 700 : 500,
            fontSize,
            cursor: isAuthority ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ThumbsUp size={iconSize} style={{ strokeWidth: userVote === 'upvote' ? 2.5 : 1.8 }} />
          <span>{upvotes}</span>
        </button>

        {/* Net Score Badge */}
        <div
          title={`Community Net Score: ${netScore} (${upvotes} up, ${downvotes} down)`}
          style={{
            fontSize,
            fontWeight: 700,
            padding: '2px 6px',
            color: netScore > 0 ? '#16A34A' : netScore < 0 ? '#DC2626' : 'var(--text-muted)',
            minWidth: '22px',
            textAlign: 'center'
          }}
        >
          {netScore > 0 ? `+${netScore}` : netScore}
        </div>

        {/* Downvote Button */}
        <button
          type="button"
          disabled={submitting || isAuthority}
          onClick={(e) => handleVote('downvote', e)}
          title={isAuthority ? 'Authorities cannot vote' : userVote === 'downvote' ? 'Remove Downvote' : 'Downvote this complaint'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding,
            border: 'none',
            borderRadius: '16px',
            backgroundColor: userVote === 'downvote' ? '#FEE2E2' : 'transparent',
            color: userVote === 'downvote' ? '#B91C1C' : 'var(--text-secondary)',
            fontWeight: userVote === 'downvote' ? 700 : 500,
            fontSize,
            cursor: isAuthority ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ThumbsDown size={iconSize} style={{ strokeWidth: userVote === 'downvote' ? 2.5 : 1.8 }} />
          <span>{downvotes}</span>
        </button>
      </div>

      {voteError && (
        <div style={{ fontSize: '0.75rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '4px' }}>
          <ShieldAlert size={12} />
          <span>{voteError}</span>
        </div>
      )}
    </div>
  );
}
