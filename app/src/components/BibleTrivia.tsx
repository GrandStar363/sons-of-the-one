import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import SocialShareButtons from './SocialShareButtons';
import { useSyncedState } from '@/hooks/useSyncedState';

interface TriviaQuestion {

  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  reference: string;
  explanation: string;
}

interface BibleTriviaProps {
  user: User | null;
  onOpenAuth: () => void;
  onReadVerse: (reference: string) => void;
}

// Comprehensive trivia questions database
const triviaQuestions: TriviaQuestion[] = [
  // BEGINNER QUESTIONS
  {
    id: 1,
    question: "Who built the ark to save his family and animals from the flood?",
    options: ["Abraham", "Moses", "Noah", "David"],
    correctAnswer: 2,
    category: "Old Testament",
    difficulty: "beginner",
    reference: "Genesis 6:14",
    explanation: "God instructed Noah to build an ark of gopher wood to survive the great flood."
  },
  {
    id: 2,
    question: "What is the first book of the Bible?",
    options: ["Exodus", "Genesis", "Matthew", "Psalms"],
    correctAnswer: 1,
    category: "General",
    difficulty: "beginner",
    reference: "Genesis 1:1",
    explanation: "Genesis means 'beginning' and tells the story of creation and the early patriarchs."
  },
  {
    id: 3,
    question: "Who was swallowed by a great fish?",
    options: ["Jonah", "Peter", "Paul", "Elijah"],
    correctAnswer: 0,
    category: "Old Testament",
    difficulty: "beginner",
    reference: "Jonah 1:17",
    explanation: "Jonah was swallowed by a great fish when he tried to flee from God's command to go to Nineveh."
  },
  {
    id: 4,
    question: "How many disciples did Jesus have?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
    category: "New Testament",
    difficulty: "beginner",
    reference: "Matthew 10:1-4",
    explanation: "Jesus chose 12 disciples to follow Him and spread His teachings."
  },
  {
    id: 5,
    question: "What did God create on the first day?",
    options: ["Animals", "Light", "Water", "Trees"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "beginner",
    reference: "Genesis 1:3",
    explanation: "God said 'Let there be light' and there was light on the first day of creation."
  },
  {
    id: 6,
    question: "Who was the mother of Jesus?",
    options: ["Elizabeth", "Mary", "Martha", "Ruth"],
    correctAnswer: 1,
    category: "New Testament",
    difficulty: "beginner",
    reference: "Luke 1:30-31",
    explanation: "The angel Gabriel told Mary she would conceive and bear a son named Jesus."
  },
  {
    id: 7,
    question: "What was the name of the garden where Adam and Eve lived?",
    options: ["Gethsemane", "Eden", "Paradise", "Babylon"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "beginner",
    reference: "Genesis 2:8",
    explanation: "God planted a garden eastward in Eden and placed Adam there."
  },
  {
    id: 8,
    question: "Who killed Goliath?",
    options: ["Saul", "Jonathan", "David", "Samuel"],
    correctAnswer: 2,
    category: "Old Testament",
    difficulty: "beginner",
    reference: "1 Samuel 17:50",
    explanation: "David defeated Goliath with a sling and a stone, trusting in the Lord."
  },
  {
    id: 9,
    question: "Where was Jesus born?",
    options: ["Nazareth", "Jerusalem", "Bethlehem", "Egypt"],
    correctAnswer: 2,
    category: "New Testament",
    difficulty: "beginner",
    reference: "Matthew 2:1",
    explanation: "Jesus was born in Bethlehem of Judaea in the days of Herod the king."
  },
  {
    id: 10,
    question: "What did Jesus turn water into at a wedding?",
    options: ["Milk", "Oil", "Wine", "Honey"],
    correctAnswer: 2,
    category: "Miracles",
    difficulty: "beginner",
    reference: "John 2:9",
    explanation: "Jesus performed His first miracle at the wedding in Cana, turning water into wine."
  },

  // INTERMEDIATE QUESTIONS
  {
    id: 11,
    question: "How many books are in the Bible?",
    options: ["66", "72", "39", "27"],
    correctAnswer: 0,
    category: "General",
    difficulty: "intermediate",
    reference: "Various",
    explanation: "The Bible contains 66 books: 39 in the Old Testament and 27 in the New Testament."
  },
  {
    id: 12,
    question: "Who was thrown into the lion's den?",
    options: ["Shadrach", "Daniel", "Ezekiel", "Jeremiah"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "intermediate",
    reference: "Daniel 6:16",
    explanation: "Daniel was thrown into the lion's den for praying to God, but God shut the lions' mouths."
  },
  {
    id: 13,
    question: "What are the first four books of the New Testament called?",
    options: ["Epistles", "Gospels", "Prophets", "Psalms"],
    correctAnswer: 1,
    category: "New Testament",
    difficulty: "intermediate",
    reference: "Matthew, Mark, Luke, John",
    explanation: "The four Gospels tell the story of Jesus's life, death, and resurrection."
  },
  {
    id: 14,
    question: "Who was the first king of Israel?",
    options: ["David", "Solomon", "Saul", "Samuel"],
    correctAnswer: 2,
    category: "Old Testament",
    difficulty: "intermediate",
    reference: "1 Samuel 10:1",
    explanation: "Saul was anointed by Samuel as the first king of Israel."
  },
  {
    id: 15,
    question: "How many days and nights did it rain during the flood?",
    options: ["7", "40", "100", "150"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "intermediate",
    reference: "Genesis 7:12",
    explanation: "The rain was upon the earth forty days and forty nights."
  },
  {
    id: 16,
    question: "Who wrote most of the Psalms?",
    options: ["Solomon", "Moses", "David", "Asaph"],
    correctAnswer: 2,
    category: "Old Testament",
    difficulty: "intermediate",
    reference: "Psalms",
    explanation: "David wrote approximately 73 of the 150 Psalms."
  },
  {
    id: 17,
    question: "What was Paul's name before his conversion?",
    options: ["Simon", "Saul", "Stephen", "Silas"],
    correctAnswer: 1,
    category: "New Testament",
    difficulty: "intermediate",
    reference: "Acts 13:9",
    explanation: "Saul, also called Paul, was converted on the road to Damascus."
  },
  {
    id: 18,
    question: "Who betrayed Jesus for 30 pieces of silver?",
    options: ["Peter", "Thomas", "Judas Iscariot", "James"],
    correctAnswer: 2,
    category: "New Testament",
    difficulty: "intermediate",
    reference: "Matthew 26:15",
    explanation: "Judas Iscariot betrayed Jesus to the chief priests for thirty pieces of silver."
  },
  {
    id: 19,
    question: "What mountain did Moses receive the Ten Commandments on?",
    options: ["Mount Carmel", "Mount Sinai", "Mount Zion", "Mount Nebo"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "intermediate",
    reference: "Exodus 19:20",
    explanation: "God called Moses to the top of Mount Sinai to receive the Ten Commandments."
  },
  {
    id: 20,
    question: "How many plagues did God send upon Egypt?",
    options: ["7", "10", "12", "15"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "intermediate",
    reference: "Exodus 7-12",
    explanation: "God sent ten plagues upon Egypt to convince Pharaoh to let His people go."
  },

  // ADVANCED QUESTIONS
  {
    id: 21,
    question: "Who was the oldest person in the Bible?",
    options: ["Adam", "Noah", "Methuselah", "Enoch"],
    correctAnswer: 2,
    category: "Characters",
    difficulty: "advanced",
    reference: "Genesis 5:27",
    explanation: "Methuselah lived 969 years, the longest lifespan recorded in the Bible."
  },
  {
    id: 22,
    question: "What was the name of Abraham's wife?",
    options: ["Sarah", "Rebecca", "Rachel", "Leah"],
    correctAnswer: 0,
    category: "Characters",
    difficulty: "advanced",
    reference: "Genesis 17:15",
    explanation: "God changed Sarai's name to Sarah, meaning 'princess' or 'mother of nations.'"
  },
  {
    id: 23,
    question: "Which prophet was taken to heaven in a chariot of fire?",
    options: ["Elisha", "Elijah", "Enoch", "Isaiah"],
    correctAnswer: 1,
    category: "Prophecy",
    difficulty: "advanced",
    reference: "2 Kings 2:11",
    explanation: "Elijah went up by a whirlwind into heaven in a chariot of fire with horses of fire."
  },
  {
    id: 24,
    question: "What is the shortest verse in the Bible?",
    options: ["God is love", "Jesus wept", "Pray always", "Be still"],
    correctAnswer: 1,
    category: "General",
    difficulty: "advanced",
    reference: "John 11:35",
    explanation: "'Jesus wept' is the shortest verse in the King James Bible."
  },
  {
    id: 25,
    question: "Who interpreted Pharaoh's dreams about the seven fat and lean cows?",
    options: ["Moses", "Joseph", "Daniel", "Aaron"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "advanced",
    reference: "Genesis 41:25",
    explanation: "Joseph interpreted Pharaoh's dreams, predicting seven years of plenty followed by seven years of famine."
  },
  {
    id: 26,
    question: "What were the names of the three Hebrew men thrown into the fiery furnace?",
    options: ["Peter, James, John", "Shadrach, Meshach, Abednego", "Abraham, Isaac, Jacob", "Moses, Aaron, Miriam"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "advanced",
    reference: "Daniel 3:23",
    explanation: "Shadrach, Meshach, and Abednego were thrown into the fiery furnace for refusing to worship the golden image."
  },
  {
    id: 27,
    question: "Who was the Roman governor who sentenced Jesus to death?",
    options: ["Herod", "Caesar", "Pontius Pilate", "Felix"],
    correctAnswer: 2,
    category: "New Testament",
    difficulty: "advanced",
    reference: "Matthew 27:26",
    explanation: "Pontius Pilate delivered Jesus to be crucified after the crowd demanded His death."
  },
  {
    id: 28,
    question: "What is the last book of the Old Testament?",
    options: ["Zechariah", "Malachi", "Haggai", "Micah"],
    correctAnswer: 1,
    category: "General",
    difficulty: "advanced",
    reference: "Malachi 4:6",
    explanation: "Malachi is the last book of the Old Testament, written around 430 BC."
  },
  {
    id: 29,
    question: "How many sons did Jacob have?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
    category: "Characters",
    difficulty: "advanced",
    reference: "Genesis 35:22",
    explanation: "Jacob had twelve sons who became the twelve tribes of Israel."
  },
  {
    id: 30,
    question: "What was the name of the pool where Jesus healed the blind man?",
    options: ["Bethesda", "Siloam", "Jordan", "Galilee"],
    correctAnswer: 1,
    category: "Miracles",
    difficulty: "advanced",
    reference: "John 9:7",
    explanation: "Jesus told the blind man to wash in the pool of Siloam, and he came seeing."
  },

  // EXPERT QUESTIONS
  {
    id: 31,
    question: "What is the name of the hill where Jesus was crucified?",
    options: ["Mount Zion", "Golgotha", "Mount Moriah", "Mount Tabor"],
    correctAnswer: 1,
    category: "New Testament",
    difficulty: "expert",
    reference: "John 19:17",
    explanation: "Golgotha, meaning 'place of a skull,' is where Jesus was crucified."
  },
  {
    id: 32,
    question: "Who was the high priest when Jesus was arrested?",
    options: ["Annas", "Caiaphas", "Zechariah", "Eli"],
    correctAnswer: 1,
    category: "New Testament",
    difficulty: "expert",
    reference: "Matthew 26:57",
    explanation: "Caiaphas was the high priest who presided over Jesus's trial before the Sanhedrin."
  },
  {
    id: 33,
    question: "What were the Urim and Thummim used for?",
    options: ["Sacrifice", "Divination/Seeking God's will", "Healing", "Worship"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "expert",
    reference: "Exodus 28:30",
    explanation: "The Urim and Thummim were objects used by the high priest to determine God's will."
  },
  {
    id: 34,
    question: "Who was the father-in-law of Moses?",
    options: ["Laban", "Jethro", "Lot", "Nahor"],
    correctAnswer: 1,
    category: "Characters",
    difficulty: "expert",
    reference: "Exodus 3:1",
    explanation: "Jethro, also called Reuel, was the priest of Midian and Moses's father-in-law."
  },
  {
    id: 35,
    question: "What is the 'Shema' in Judaism?",
    options: ["A prayer for the dead", "The declaration 'Hear, O Israel'", "A blessing for bread", "A Sabbath song"],
    correctAnswer: 1,
    category: "General",
    difficulty: "expert",
    reference: "Deuteronomy 6:4",
    explanation: "The Shema is the central declaration of Jewish faith: 'Hear, O Israel: The LORD our God is one LORD.'"
  },
  {
    id: 36,
    question: "Who was the prophet that anointed both Saul and David as kings?",
    options: ["Nathan", "Elijah", "Samuel", "Isaiah"],
    correctAnswer: 2,
    category: "Prophecy",
    difficulty: "expert",
    reference: "1 Samuel 10:1, 16:13",
    explanation: "Samuel anointed both Saul and David as kings of Israel."
  },
  {
    id: 37,
    question: "What is the meaning of 'Immanuel'?",
    options: ["Prince of Peace", "God with us", "Mighty God", "Everlasting Father"],
    correctAnswer: 1,
    category: "Prophecy",
    difficulty: "expert",
    reference: "Isaiah 7:14",
    explanation: "Immanuel means 'God with us,' a prophetic name for the Messiah."
  },
  {
    id: 38,
    question: "Who was the first Christian martyr?",
    options: ["James", "Peter", "Stephen", "Paul"],
    correctAnswer: 2,
    category: "New Testament",
    difficulty: "expert",
    reference: "Acts 7:59",
    explanation: "Stephen was stoned to death, becoming the first Christian martyr."
  },
  {
    id: 39,
    question: "What is the 'Day of Atonement' called in Hebrew?",
    options: ["Passover", "Yom Kippur", "Sukkot", "Shavuot"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "expert",
    reference: "Leviticus 23:27",
    explanation: "Yom Kippur is the Day of Atonement, the holiest day in the Jewish calendar."
  },
  {
    id: 40,
    question: "Which book contains the 'Suffering Servant' prophecy about the Messiah?",
    options: ["Jeremiah", "Ezekiel", "Isaiah", "Daniel"],
    correctAnswer: 2,
    category: "Prophecy",
    difficulty: "expert",
    reference: "Isaiah 53",
    explanation: "Isaiah 53 contains the famous 'Suffering Servant' prophecy fulfilled by Jesus Christ."
  },
  {
    id: 41,
    question: "What is the Greek word for 'church' in the New Testament?",
    options: ["Ekklesia", "Koinonia", "Agape", "Logos"],
    correctAnswer: 0,
    category: "General",
    difficulty: "expert",
    reference: "Matthew 16:18",
    explanation: "Ekklesia means 'called out ones' or 'assembly,' translated as 'church' in English."
  },
  {
    id: 42,
    question: "Who wrote the book of Hebrews?",
    options: ["Paul", "Peter", "Unknown", "Luke"],
    correctAnswer: 2,
    category: "New Testament",
    difficulty: "expert",
    reference: "Hebrews",
    explanation: "The author of Hebrews is unknown, though Paul, Barnabas, and Apollos have been suggested."
  },
  {
    id: 43,
    question: "What does 'Selah' mean in the Psalms?",
    options: ["Amen", "Pause/Musical interlude", "Praise", "Forever"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "expert",
    reference: "Psalms 3:2",
    explanation: "Selah is believed to indicate a pause for reflection or a musical interlude."
  },
  {
    id: 44,
    question: "Who was the queen who visited Solomon to test his wisdom?",
    options: ["Queen of Egypt", "Queen of Sheba", "Queen Jezebel", "Queen Esther"],
    correctAnswer: 1,
    category: "Old Testament",
    difficulty: "expert",
    reference: "1 Kings 10:1",
    explanation: "The Queen of Sheba came to test Solomon with hard questions and was amazed by his wisdom."
  },
  {
    id: 45,
    question: "What is the 'Pentateuch'?",
    options: ["The first 5 books of the Bible", "The 10 Commandments", "The 5 major prophets", "The 5 Gospels"],
    correctAnswer: 0,
    category: "General",
    difficulty: "expert",
    reference: "Genesis-Deuteronomy",
    explanation: "The Pentateuch refers to the first five books of the Bible, also called the Torah or Books of Moses."
  }
];

const categories = ['All', 'Old Testament', 'New Testament', 'Characters', 'Prophecy', 'Miracles', 'General'];
const difficulties: Array<'beginner' | 'intermediate' | 'advanced' | 'expert'> = ['beginner', 'intermediate', 'advanced', 'expert'];

const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'from-green-500 to-emerald-600', points: 10, time: 30 },
  intermediate: { label: 'Intermediate', color: 'from-blue-500 to-cyan-600', points: 20, time: 25 },
  advanced: { label: 'Advanced', color: 'from-purple-500 to-violet-600', points: 30, time: 20 },
  expert: { label: 'Expert', color: 'from-red-500 to-rose-600', points: 50, time: 15 }
};

const BibleTrivia: React.FC<BibleTriviaProps> = ({ user, onOpenAuth, onReadVerse }) => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result' | 'leaderboard'>('setup');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('beginner');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; time: number }>>([]);
  // Persisted to user_data; localStorage is an offline cache.
  const [highScores, setHighScores] = useSyncedState<Array<{ name: string; score: number; difficulty: string; date: string }>>(
    'bible-trivia-highscores', 'trivia_highscores', [], user);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' || !timerEnabled || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timerEnabled, selectedAnswer, currentQuestionIndex]);

  const handleTimeout = () => {
    setSelectedAnswer(-1); // -1 indicates timeout
    setShowExplanation(true);
    setStreak(0);
    setAnswers(prev => [...prev, { correct: false, time: difficultyConfig[selectedDifficulty].time }]);
  };

  const startGame = () => {
    // Filter questions by difficulty and category
    let filteredQuestions = triviaQuestions.filter(q => q.difficulty === selectedDifficulty);
    if (selectedCategory !== 'All') {
      filteredQuestions = filteredQuestions.filter(q => q.category === selectedCategory);
    }

    // Shuffle and take 10 questions
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const gameQuestions = shuffled.slice(0, Math.min(10, shuffled.length));

    if (gameQuestions.length < 5) {
      alert('Not enough questions for this category and difficulty. Please select different options.');
      return;
    }

    setQuestions(gameQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswers([]);
    setTotalTime(0);
    setTimeLeft(difficultyConfig[selectedDifficulty].time);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameState('playing');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const timeTaken = difficultyConfig[selectedDifficulty].time - timeLeft;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    setTotalTime(prev => prev + timeTaken);
    setAnswers(prev => [...prev, { correct: isCorrect, time: timeTaken }]);

    if (isCorrect) {
      const basePoints = difficultyConfig[selectedDifficulty].points;
      const timeBonus = timerEnabled ? Math.floor(timeLeft * 2) : 0;
      const streakBonus = streak * 5;
      setScore(prev => prev + basePoints + timeBonus + streakBonus);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(difficultyConfig[selectedDifficulty].time);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    // Save high score
    const newScore = {
      name: user?.email?.split('@')[0] || 'Guest',
      score,
      difficulty: selectedDifficulty,
      date: new Date().toLocaleDateString()
    };

    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setHighScores(updatedScores);
    setGameState('result');
  };

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswers = answers.filter(a => a.correct).length;
  const accuracy = answers.length > 0 ? Math.round((correctAnswers / answers.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#14B8A6]/20 mb-4">
          <svg className="w-8 h-8 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
          Bible <span className="text-[#F59E0B]">Trivia</span> Challenge
        </h1>
        <p className="text-white/60">Test your knowledge of God's Word at different levels</p>
      </div>

      {/* Setup Screen */}
      {gameState === 'setup' && (
        <div className="space-y-8">
          {/* Difficulty Selection */}
          <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Select Difficulty
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedDifficulty === diff
                      ? `bg-gradient-to-r ${difficultyConfig[diff].color} border-transparent text-white`
                      : 'bg-white/5 border-white/20 text-white/80 hover:border-white/40'
                  }`}
                >
                  <div className="font-bold">{difficultyConfig[diff].label}</div>
                  <div className="text-sm opacity-80">{difficultyConfig[diff].points} pts/question</div>
                  <div className="text-xs opacity-60">{difficultyConfig[diff].time}s timer</div>
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="bg-gradient-to-br from-[#3B82F6]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#3B82F6]/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Select Category
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Toggle */}
          <div className="bg-gradient-to-br from-[#F59E0B]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#F59E0B]/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timer Mode
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  {timerEnabled ? 'Race against the clock for bonus points!' : 'Take your time to answer'}
                </p>
              </div>
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`w-14 h-8 rounded-full transition-all ${
                  timerEnabled ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]' : 'bg-white/20'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-lg transform transition-transform ${
                  timerEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-bold text-lg rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Challenge
            </button>
            <button
              onClick={() => setGameState('leaderboard')}
              className="px-8 py-4 bg-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Leaderboard
            </button>
          </div>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#14B8A6] to-[#3B82F6] transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-white/80">
            <div className="flex items-center space-x-4">
              <span className="text-sm">Question {currentQuestionIndex + 1}/{questions.length}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${difficultyConfig[currentQuestion.difficulty].color}`}>
                {difficultyConfig[currentQuestion.difficulty].label}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-white/10">{currentQuestion.category}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-[#F59E0B]">{score}</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center text-orange-400">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold">{streak}x</span>
                </div>
              )}
            </div>
          </div>

          {/* Timer */}
          {timerEnabled && selectedAnswer === null && (
            <div className="relative">
              <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeLeft > 10 ? 'bg-gradient-to-r from-[#14B8A6] to-[#0D9488]' :
                    timeLeft > 5 ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${(timeLeft / difficultyConfig[selectedDifficulty].time) * 100}%` }}
                />
              </div>
              <div className={`absolute right-0 -top-6 font-bold ${
                timeLeft > 10 ? 'text-[#14B8A6]' : timeLeft > 5 ? 'text-[#F59E0B]' : 'text-red-500'
              }`}>
                {timeLeft}s
              </div>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Answer Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = selectedAnswer !== null;

                let buttonClass = 'bg-white/5 border-white/20 hover:border-[#14B8A6]/50 hover:bg-white/10';
                if (showResult) {
                  if (isCorrect) {
                    buttonClass = 'bg-green-500/20 border-green-500 text-green-400';
                  } else if (isSelected && !isCorrect) {
                    buttonClass = 'bg-red-500/20 border-red-500 text-red-400';
                  } else {
                    buttonClass = 'bg-white/5 border-white/10 opacity-50';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${buttonClass} ${
                      !showResult ? 'text-white' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold ${
                        showResult && isCorrect ? 'bg-green-500 text-white' :
                        showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                        'bg-white/10 text-white/60'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {showResult && isCorrect && (
                        <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-white/80 text-sm">{currentQuestion.explanation}</p>
                    <button
                      onClick={() => onReadVerse(currentQuestion.reference)}
                      className="mt-2 text-[#14B8A6] text-sm hover:underline flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Read {currentQuestion.reference}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next Button */}
          {selectedAnswer !== null && (
            <div className="flex justify-center">
              <button
                onClick={nextQuestion}
                className="px-8 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-bold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal flex items-center"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    See Results
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Screen */}
      {gameState === 'result' && (
        <div className="space-y-8">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-[#F59E0B]/20 via-[#0f2942] to-[#14B8A6]/20 border border-[#F59E0B]/30 rounded-2xl p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Challenge Complete!</h2>
            <p className="text-white/60 mb-6">Here's how you did:</p>

            <div className="text-6xl font-bold text-[#F59E0B] mb-2">{score}</div>
            <p className="text-white/60 mb-8">Total Points</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-[#14B8A6]">{correctAnswers}/{questions.length}</div>
                <div className="text-white/60 text-sm">Correct</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-[#3B82F6]">{accuracy}%</div>
                <div className="text-white/60 text-sm">Accuracy</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-400">{bestStreak}x</div>
                <div className="text-white/60 text-sm">Best Streak</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400">{totalTime}s</div>
                <div className="text-white/60 text-sm">Total Time</div>
              </div>
            </div>
          </div>

          {/* Performance Message */}
          <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-6 text-center">
            {accuracy >= 80 ? (
              <>
                <h3 className="text-xl font-bold text-[#14B8A6] mb-2">Excellent Work!</h3>
                <p className="text-white/70">You have a deep knowledge of Scripture. Keep studying and growing!</p>
              </>
            ) : accuracy >= 60 ? (
              <>
                <h3 className="text-xl font-bold text-[#3B82F6] mb-2">Good Job!</h3>
                <p className="text-white/70">You're on the right track. Keep reading God's Word daily!</p>
              </>
            ) : accuracy >= 40 ? (
              <>
                <h3 className="text-xl font-bold text-[#F59E0B] mb-2">Keep Learning!</h3>
                <p className="text-white/70">Every question is an opportunity to learn more about God's Word.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-purple-400 mb-2">Don't Give Up!</h3>
                <p className="text-white/70">The Bible is a lifelong journey. Keep reading and you'll grow!</p>
              </>
            )}
          </div>

          {/* Share Your Score */}
          <div className="bg-gradient-to-br from-[#8B5CF6]/10 via-[#0f2942] to-[#EC4899]/10 border border-[#8B5CF6]/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Share Your Score!</h3>
            <SocialShareButtons
              type="trivia_score"
              title="Challenge your friends to beat your score!"
              score={score}
              maxScore={questions.length * difficultyConfig[selectedDifficulty].points + 100}
              userId={user?.id}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setGameState('setup')}
              className="px-8 py-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-bold text-lg rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Play Again
            </button>
            <button
              onClick={() => setGameState('leaderboard')}
              className="px-8 py-4 bg-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Leaderboard
            </button>
          </div>
        </div>
      )}




      {/* Leaderboard Screen */}
      {gameState === 'leaderboard' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#F59E0B]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#F59E0B]/30 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Top Scores
            </h2>

            {highScores.length > 0 ? (
              <div className="space-y-3">
                {highScores.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-4 rounded-xl ${
                      index === 0 ? 'bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 border border-[#F59E0B]/30' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30' :
                      index === 2 ? 'bg-gradient-to-r from-orange-700/20 to-orange-800/20 border border-orange-700/30' :
                      'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 ${
                      index === 0 ? 'bg-[#F59E0B] text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-700 text-white' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{entry.name}</div>
                      <div className="text-white/60 text-sm">
                        {entry.difficulty} • {entry.date}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#F59E0B]">{entry.score}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-white/60">No scores yet. Be the first to play!</p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setGameState('setup')}
              className="px-8 py-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-bold text-lg rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibleTrivia;
