
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const questionPool = [
  { id: 'b1', question: 'How many days did God take to create the world?', options: ['5', '6', '7', '10'], correct: 1, difficulty: 'beginner', category: 'Old Testament', reference: 'Genesis 1-2' },
  { id: 'b2', question: 'Who built the ark?', options: ['Moses', 'Noah', 'Abraham', 'David'], correct: 1, difficulty: 'beginner', category: 'Old Testament', reference: 'Genesis 6' },
  { id: 'b3', question: 'What is the first book of the Bible?', options: ['Exodus', 'Genesis', 'Leviticus', 'Matthew'], correct: 1, difficulty: 'beginner', category: 'General', reference: 'Genesis 1:1' },
  { id: 'b4', question: 'Who was swallowed by a great fish?', options: ['Jonah', 'Daniel', 'Elijah', 'Peter'], correct: 0, difficulty: 'beginner', category: 'Old Testament', reference: 'Jonah 1:17' },
  { id: 'b5', question: 'How many disciples did Jesus have?', options: ['10', '11', '12', '13'], correct: 2, difficulty: 'beginner', category: 'New Testament', reference: 'Matthew 10:1-4' },
  { id: 'b6', question: 'Who was the first man?', options: ['Noah', 'Adam', 'Abraham', 'Moses'], correct: 1, difficulty: 'beginner', category: 'Old Testament', reference: 'Genesis 2:7' },
  { id: 'b7', question: 'Where was Jesus born?', options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Galilee'], correct: 2, difficulty: 'beginner', category: 'New Testament', reference: 'Matthew 2:1' },
  { id: 'b8', question: 'Who killed Goliath?', options: ['Saul', 'David', 'Jonathan', 'Samuel'], correct: 1, difficulty: 'beginner', category: 'Old Testament', reference: '1 Samuel 17' },
  { id: 'b9', question: 'What did Jesus turn water into?', options: ['Milk', 'Wine', 'Oil', 'Blood'], correct: 1, difficulty: 'beginner', category: 'Miracles', reference: 'John 2:1-11' },
  { id: 'b10', question: 'How many books are in the Bible?', options: ['39', '66', '72', '81'], correct: 1, difficulty: 'beginner', category: 'General', reference: 'Bible' },
  { id: 'i1', question: 'Who was the oldest person in the Bible?', options: ['Adam', 'Noah', 'Methuselah', 'Enoch'], correct: 2, difficulty: 'intermediate', category: 'Characters', reference: 'Genesis 5:27' },
  { id: 'i2', question: 'What was the name of Moses brother?', options: ['Aaron', 'Joshua', 'Caleb', 'Levi'], correct: 0, difficulty: 'intermediate', category: 'Characters', reference: 'Exodus 4:14' },
  { id: 'i3', question: 'How many plagues were sent on Egypt?', options: ['7', '9', '10', '12'], correct: 2, difficulty: 'intermediate', category: 'Old Testament', reference: 'Exodus 7-12' },
  { id: 'i4', question: 'Who was thrown into the lions den?', options: ['David', 'Daniel', 'Elijah', 'Shadrach'], correct: 1, difficulty: 'intermediate', category: 'Old Testament', reference: 'Daniel 6' },
  { id: 'i5', question: 'What was Paul name before his conversion?', options: ['Simon', 'Saul', 'Stephen', 'Silas'], correct: 1, difficulty: 'intermediate', category: 'New Testament', reference: 'Acts 9:1' },
  { id: 'i6', question: 'Who betrayed Jesus for 30 pieces of silver?', options: ['Peter', 'Thomas', 'Judas', 'James'], correct: 2, difficulty: 'intermediate', category: 'New Testament', reference: 'Matthew 26:14-16' },
  { id: 'i7', question: 'What mountain did Moses receive the Ten Commandments on?', options: ['Mount Carmel', 'Mount Sinai', 'Mount Zion', 'Mount Nebo'], correct: 1, difficulty: 'intermediate', category: 'Old Testament', reference: 'Exodus 19-20' },
  { id: 'i8', question: 'Who was the first king of Israel?', options: ['David', 'Solomon', 'Saul', 'Samuel'], correct: 2, difficulty: 'intermediate', category: 'Old Testament', reference: '1 Samuel 10:1' },
  { id: 'i9', question: 'How many days and nights did it rain during the flood?', options: ['7', '30', '40', '100'], correct: 2, difficulty: 'intermediate', category: 'Old Testament', reference: 'Genesis 7:12' },
  { id: 'i10', question: 'Who wrote most of the Psalms?', options: ['Moses', 'Solomon', 'David', 'Asaph'], correct: 2, difficulty: 'intermediate', category: 'Old Testament', reference: 'Psalms' },
  { id: 'a1', question: 'What was the name of Abraham father?', options: ['Nahor', 'Terah', 'Haran', 'Lot'], correct: 1, difficulty: 'advanced', category: 'Characters', reference: 'Genesis 11:26' },
  { id: 'a2', question: 'Which prophet was taken to heaven in a chariot of fire?', options: ['Elijah', 'Elisha', 'Isaiah', 'Ezekiel'], correct: 0, difficulty: 'advanced', category: 'Old Testament', reference: '2 Kings 2:11' },
  { id: 'a3', question: 'What was the name of Ruth mother-in-law?', options: ['Sarah', 'Naomi', 'Rachel', 'Leah'], correct: 1, difficulty: 'advanced', category: 'Characters', reference: 'Ruth 1:2' },
  { id: 'a4', question: 'How many sons did Jacob have?', options: ['10', '11', '12', '13'], correct: 2, difficulty: 'advanced', category: 'Old Testament', reference: 'Genesis 35:22' },
  { id: 'a5', question: 'What was the first miracle Jesus performed?', options: ['Healing a blind man', 'Walking on water', 'Turning water to wine', 'Feeding 5000'], correct: 2, difficulty: 'advanced', category: 'Miracles', reference: 'John 2:1-11' },
  { id: 'e1', question: 'What was the name of the pool where Jesus healed the paralytic?', options: ['Siloam', 'Bethesda', 'Jordan', 'Galilee'], correct: 1, difficulty: 'expert', category: 'Miracles', reference: 'John 5:2' },
  { id: 'e2', question: 'Who was the high priest when Jesus was crucified?', options: ['Annas', 'Caiaphas', 'Zechariah', 'Eli'], correct: 1, difficulty: 'expert', category: 'New Testament', reference: 'Matthew 26:57' },
  { id: 'e3', question: 'What was the name of Timothy grandmother?', options: ['Lois', 'Eunice', 'Priscilla', 'Lydia'], correct: 0, difficulty: 'expert', category: 'Characters', reference: '2 Timothy 1:5' },
  { id: 'e4', question: 'How many years did the Israelites wander in the wilderness?', options: ['20', '30', '40', '50'], correct: 2, difficulty: 'expert', category: 'Old Testament', reference: 'Numbers 14:33' },
  { id: 'e5', question: 'What was the name of the island where John wrote Revelation?', options: ['Cyprus', 'Crete', 'Patmos', 'Malta'], correct: 2, difficulty: 'expert', category: 'New Testament', reference: 'Revelation 1:9' },
];

const achievements = [
  { id: 'first_day', name: 'First Steps', description: 'Complete your first daily challenge', requirement: 1 },
  { id: 'week_streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', requirement: 7 },
  { id: 'month_streak', name: 'Monthly Master', description: 'Maintain a 30-day streak', requirement: 30 },
  { id: 'year_streak', name: 'Year of Devotion', description: 'Maintain a 365-day streak', requirement: 365 },
  { id: 'perfect_5', name: 'Perfect Five', description: 'Get 5 perfect daily scores', requirement: 5, type: 'perfect' },
  { id: 'perfect_25', name: 'Quarter Century', description: 'Get 25 perfect daily scores', requirement: 25, type: 'perfect' },
  { id: 'total_50', name: 'Fifty Days', description: 'Complete 50 daily challenges', requirement: 50, type: 'total' },
  { id: 'total_100', name: 'Centurion', description: 'Complete 100 daily challenges', requirement: 100, type: 'total' },
];

function getDailyDifficulty(date: Date): string {
  const dayOfWeek = date.getDay();
  const difficulties = ['beginner', 'beginner', 'intermediate', 'intermediate', 'advanced', 'advanced', 'expert'];
  return difficulties[dayOfWeek];
}

function generateDailyQuestions(date: Date): any[] {
  const difficulty = getDailyDifficulty(date);
  const dateString = date.toISOString().split('T')[0];
  const seed = dateString.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const difficultyQuestions = questionPool.filter(q => q.difficulty === difficulty);
  const shuffled = [...difficultyQuestions].sort((a, b) => {
    const hashA = (seed * a.id.charCodeAt(1)) % 1000;
    const hashB = (seed * b.id.charCodeAt(1)) % 1000;
    return hashA - hashB;
  });
  return shuffled.slice(0, 5).map((q, index) => ({ ...q, questionNumber: index + 1 }));
}

async function dbFetch(url: string, key: string, endpoint: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  
  const fullUrl = url + '/rest/v1/' + endpoint;
  try {
    const response = await fetch(fullUrl, { ...options, headers });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { error: 'parse_error', message: text };
    }
  } catch (err: any) {
    return { error: 'fetch_error', message: err.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const body = await req.json();
    const { action, userId, answers, date } = body;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const requestDate = date || todayStr;

    if (action === 'get_daily_challenge') {
      // Get existing progress
      const progressData = await dbFetch(supabaseUrl, supabaseKey, 
        'daily_trivia_progress?user_id=eq.' + encodeURIComponent(userId) + '&date=eq.' + encodeURIComponent(requestDate) + '&select=*');
      const existingProgress = Array.isArray(progressData) && progressData.length > 0 ? progressData[0] : null;

      // Get streak data
      let streakDataArr = await dbFetch(supabaseUrl, supabaseKey, 
        'daily_trivia_streaks?user_id=eq.' + encodeURIComponent(userId) + '&select=*');
      let streakData = Array.isArray(streakDataArr) && streakDataArr.length > 0 ? streakDataArr[0] : null;

      if (!streakData) {
        const newStreakArr = await dbFetch(supabaseUrl, supabaseKey, 'daily_trivia_streaks', {
          method: 'POST',
          body: JSON.stringify({ user_id: userId })
        });
        streakData = Array.isArray(newStreakArr) && newStreakArr.length > 0 ? newStreakArr[0] : newStreakArr;
      }

      // Check if streak should be reset
      if (streakData && streakData.last_completed_date) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (streakData.last_completed_date !== todayStr && streakData.last_completed_date !== yesterdayStr) {
          await dbFetch(supabaseUrl, supabaseKey, 
            'daily_trivia_streaks?user_id=eq.' + encodeURIComponent(userId), {
            method: 'PATCH',
            body: JSON.stringify({ current_streak: 0, updated_at: new Date().toISOString() })
          });
          streakData.current_streak = 0;
        }
      }

      // Get achievements
      const userAchievements = await dbFetch(supabaseUrl, supabaseKey, 
        'daily_trivia_achievements?user_id=eq.' + encodeURIComponent(userId) + '&select=*');

      // Get calendar data
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const calendarData = await dbFetch(supabaseUrl, supabaseKey, 
        'daily_trivia_progress?user_id=eq.' + encodeURIComponent(userId) + '&date=gte.' + sixtyDaysAgo.toISOString().split('T')[0] + '&select=date,completed,perfect_score,score&order=date.desc');

      if (existingProgress) {
        return new Response(JSON.stringify({
          success: true,
          challenge: existingProgress,
          streak: streakData,
          achievements: Array.isArray(userAchievements) ? userAchievements : [],
          calendar: Array.isArray(calendarData) ? calendarData : [],
          difficulty: getDailyDifficulty(new Date(requestDate)),
          allAchievements: achievements
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Generate new questions
      const questions = generateDailyQuestions(new Date(requestDate));
      
      const insertData = {
        user_id: userId,
        date: requestDate,
        questions: questions,
        answers: [],
        score: 0,
        completed: false,
        perfect_score: false
      };
      
      const newProgressArr = await dbFetch(supabaseUrl, supabaseKey, 'daily_trivia_progress', {
        method: 'POST',
        body: JSON.stringify(insertData)
      });
      
      const newProgress = Array.isArray(newProgressArr) && newProgressArr.length > 0 ? newProgressArr[0] : newProgressArr;

      return new Response(JSON.stringify({
        success: true,
        challenge: newProgress,
        streak: streakData,
        achievements: Array.isArray(userAchievements) ? userAchievements : [],
        calendar: Array.isArray(calendarData) ? calendarData : [],
        difficulty: getDailyDifficulty(new Date(requestDate)),
        allAchievements: achievements
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'submit_answer') {
      const { questionIndex, selectedAnswer } = answers;
      
      const progressArr = await dbFetch(supabaseUrl, supabaseKey, 
        'daily_trivia_progress?user_id=eq.' + encodeURIComponent(userId) + '&date=eq.' + encodeURIComponent(requestDate) + '&select=*');
      const progress = Array.isArray(progressArr) && progressArr.length > 0 ? progressArr[0] : null;

      if (!progress) {
        return new Response(JSON.stringify({ success: false, error: 'No challenge found for today' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (progress.completed) {
        return new Response(JSON.stringify({ success: false, message: 'Challenge already completed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const questions = progress.questions;
      const currentAnswers = progress.answers || [];
      const question = questions[questionIndex];
      const isCorrect = question.correct === selectedAnswer;
      const pointsEarned = isCorrect ? 20 : 0;
      
      currentAnswers.push({ questionIndex, selectedAnswer, isCorrect, pointsEarned });

      const newScore = progress.score + pointsEarned;
      const isCompleted = currentAnswers.length >= 5;
      const isPerfect = isCompleted && currentAnswers.every((a: any) => a.isCorrect);
      const finalScore = isPerfect ? newScore + 50 : newScore;

      await dbFetch(supabaseUrl, supabaseKey, 
        'daily_trivia_progress?id=eq.' + progress.id, {
        method: 'PATCH',
        body: JSON.stringify({
          answers: currentAnswers,
          score: finalScore,
          completed: isCompleted,
          perfect_score: isPerfect,
          updated_at: new Date().toISOString()
        })
      });

      let updatedStreak = null;
      const newAchievementsList: any[] = [];

      if (isCompleted) {
        const streakArr = await dbFetch(supabaseUrl, supabaseKey, 
          'daily_trivia_streaks?user_id=eq.' + encodeURIComponent(userId) + '&select=*');
        const streakData = Array.isArray(streakArr) && streakArr.length > 0 ? streakArr[0] : null;

        if (streakData) {
          const lastDate = streakData.last_completed_date;
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          let newCurrentStreak = streakData.current_streak || 0;
          if (lastDate !== requestDate) {
            newCurrentStreak = (lastDate === yesterdayStr || !lastDate) ? (streakData.current_streak || 0) + 1 : 1;
          }
          
          const newLongestStreak = Math.max(streakData.longest_streak || 0, newCurrentStreak);
          const newTotalDays = lastDate !== requestDate ? (streakData.total_days_completed || 0) + 1 : (streakData.total_days_completed || 0);
          const newPerfectDays = isPerfect && lastDate !== requestDate ? (streakData.perfect_days || 0) + 1 : (streakData.perfect_days || 0);
          const newTotalPoints = (streakData.total_points || 0) + (lastDate !== requestDate ? finalScore : 0);

          const newStreakArr = await dbFetch(supabaseUrl, supabaseKey, 
            'daily_trivia_streaks?user_id=eq.' + encodeURIComponent(userId), {
            method: 'PATCH',
            body: JSON.stringify({
              current_streak: newCurrentStreak,
              longest_streak: newLongestStreak,
              last_completed_date: requestDate,
              total_days_completed: newTotalDays,
              perfect_days: newPerfectDays,
              total_points: newTotalPoints,
              updated_at: new Date().toISOString()
            })
          });
          updatedStreak = Array.isArray(newStreakArr) && newStreakArr.length > 0 ? newStreakArr[0] : newStreakArr;

          // Check achievements
          const existingAchievementsArr = await dbFetch(supabaseUrl, supabaseKey, 
            'daily_trivia_achievements?user_id=eq.' + encodeURIComponent(userId) + '&select=achievement_id');
          const existingIds = new Set((Array.isArray(existingAchievementsArr) ? existingAchievementsArr : []).map((a: any) => a.achievement_id));
          
          for (const achievement of achievements) {
            if (existingIds.has(achievement.id)) continue;
            let earned = false;
            if (achievement.type === 'perfect') earned = newPerfectDays >= achievement.requirement;
            else if (achievement.type === 'total') earned = newTotalDays >= achievement.requirement;
            else earned = newCurrentStreak >= achievement.requirement || newLongestStreak >= achievement.requirement;
            
            if (earned) {
              await dbFetch(supabaseUrl, supabaseKey, 'daily_trivia_achievements', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, achievement_id: achievement.id })
              });
              newAchievementsList.push(achievement);
            }
          }
        }
      }

      return new Response(JSON.stringify({
        success: true,
        isCorrect,
        correctAnswer: question.correct,
        explanation: question.reference,
        pointsEarned: isCorrect ? pointsEarned : 0,
        totalScore: finalScore,
        isCompleted,
        isPerfect,
        perfectBonus: isPerfect ? 50 : 0,
        streak: updatedStreak,
        newAchievements: newAchievementsList
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
