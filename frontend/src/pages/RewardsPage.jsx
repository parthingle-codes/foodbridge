import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { rewardService } from '../services';
import {
  Trophy, Award, Crown, CalendarCheck, Leaf, Star, Medal,
  TrendingUp, Gift, Heart, Loader2, ChevronRight
} from 'lucide-react';

const badgeConfig = [
  { key: 'food_hero', name: 'Food Hero', description: 'Donated 10+ times', icon: Award, color: 'text-amber-500 bg-amber-100', ringColor: 'ring-amber-300' },
  { key: 'community_champion', name: 'Community Champion', description: 'Fed 1000+ people', icon: Crown, color: 'text-purple-500 bg-purple-100', ringColor: 'ring-purple-300' },
  { key: 'consistent_donor', name: 'Consistent Donor', description: 'Donated every week for a month', icon: CalendarCheck, color: 'text-green-500 bg-green-100', ringColor: 'ring-green-300' },
  { key: 'zero_waste', name: 'Zero Waste Contributor', description: 'All donations utilized', icon: Leaf, color: 'text-emerald-500 bg-emerald-100', ringColor: 'ring-emerald-300' },
  { key: 'rising_star', name: 'Rising Star', description: 'Top donor for a month', icon: Star, color: 'text-blue-500 bg-blue-100', ringColor: 'ring-blue-300' },
  { key: 'generous_heart', name: 'Generous Heart', description: '500+ servings donated', icon: Heart, color: 'text-rose-500 bg-rose-100', ringColor: 'ring-rose-300' },
];

const rankMedals = ['🥇', '🥈', '🥉'];

export default function RewardsPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rewardsRes, leaderboardRes, badgesRes] = await Promise.allSettled([
        rewardService.getRewards(),
        rewardService.getLeaderboard(),
        rewardService.getBadges(),
      ]);
      if (rewardsRes.status === 'fulfilled' && rewardsRes.value?.success) {
        setRewards(rewardsRes.value.data);
      }
      if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value?.success) {
        setLeaderboard(leaderboardRes.value.data || []);
      }
      if (badgesRes.status === 'fulfilled' && badgesRes.value?.success) {
        setBadges(badgesRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const earnedBadgeKeys = badges.map(b => b.key || b.name?.toLowerCase().replace(/\s/g, '_'));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-7 h-7 text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900">Rewards & Recognition</h1>
      </div>

      {/* Credits Summary */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-sm font-medium">Total Credits Earned</p>
            <p className="text-4xl font-bold mt-1">{rewards?.totalCredits || 0}</p>
            <p className="text-amber-100 text-sm mt-2">
              Current Rank: <span className="text-white font-semibold">#{rewards?.rank || '—'}</span>
            </p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{rewards?.totalDonations || 0}</p>
            <p className="text-xs text-amber-100">Donations</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{rewards?.totalServings || 0}</p>
            <p className="text-xs text-amber-100">Servings</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{rewards?.monthlyCredits || 0}</p>
            <p className="text-xs text-amber-100">This Month</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-amber-500" /> Badge Collection
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badgeConfig.map((badge) => {
            const Icon = badge.icon;
            const isEarned = earnedBadgeKeys.includes(badge.key);
            return (
              <div
                key={badge.key}
                className={`rounded-xl p-4 text-center transition-all ${
                  isEarned
                    ? `bg-white border-2 ${badge.ringColor} shadow-sm`
                    : 'bg-gray-50 border border-gray-200 opacity-50'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${isEarned ? badge.color : 'bg-gray-200 text-gray-400'}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <p className={`font-semibold text-sm ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}>
                  {badge.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                {isEarned && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    ✓ Earned
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" /> Monthly Leaderboard
        </h2>
        {leaderboard.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Leaderboard data will appear here</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium">Rank</th>
                  <th className="text-left py-3 px-2 font-medium">Donor</th>
                  <th className="text-right py-3 px-2 font-medium">Donations</th>
                  <th className="text-right py-3 px-2 font-medium">Servings</th>
                  <th className="text-right py-3 px-2 font-medium">Credits</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => {
                  const isCurrentUser = entry.userId === user?.id;
                  return (
                    <tr
                      key={entry.userId || i}
                      className={`border-b border-gray-50 ${isCurrentUser ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="py-3 px-2">
                        <span className="text-lg">{i < 3 ? rankMedals[i] : `#${i + 1}`}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {entry.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className={`font-medium ${isCurrentUser ? 'text-green-700' : 'text-gray-900'}`}>
                            {entry.name} {isCurrentUser && '(You)'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-gray-600">{entry.donations || 0}</td>
                      <td className="py-3 px-2 text-right text-gray-600">{entry.servings || 0}</td>
                      <td className="py-3 px-2 text-right font-semibold text-gray-900">{entry.credits || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Donation History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-green-600" /> Recent Donation Credits
        </h2>
        {rewards?.recentCredits?.length > 0 ? (
          <div className="space-y-3">
            {rewards.recentCredits.map((credit, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{credit.foodName || credit.description}</p>
                  <p className="text-xs text-gray-400">{new Date(credit.date || credit.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-green-600 font-semibold text-sm">+{credit.credits} pts</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Your donation credits will appear here</p>
        )}
      </div>
    </div>
  );
}
