// Bible trivia question bank.
//
// Lifted verbatim from the recovered daily-trivia function so multiplayer and
// tournament matches ask the same questions as the daily challenge, rather
// than inventing a second, inconsistent set.
export interface Question {
  id: string; question: string; options: string[]; correct: number;
  difficulty: string; category: string; reference: string;
}

export const QUESTIONS: Question[] = [
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

/** Deterministic shuffle so both players in a match see the same order. */
export function pickQuestions(count: number, seed: number, difficulty?: string): Question[] {
  const pool = difficulty ? QUESTIONS.filter(q => q.difficulty === difficulty) : QUESTIONS;
  const scored = pool.map((q, i) => ({ q, k: (seed * (i + 7) * 2654435761) % 1000003 }));
  scored.sort((a, b) => a.k - b.k);
  return scored.slice(0, count).map(s => s.q);
}
