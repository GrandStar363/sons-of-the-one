import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useSyncedState } from '@/hooks/useSyncedState';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Play, 
  ChevronRight, 
  Star, 
  Award, 
  Flame,
  Heart,
  Sparkles,
  Target,
  Users,
  Crown,
  Zap,
  BookMarked,
  GraduationCap,
  ArrowRight,
  Circle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LessonsPageProps {
  user: User | null;
  onOpenAuth: () => void;
  onReadVerse: (reference: string) => void;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  scriptures: string[];
  objectives: string[];
  content: string;
}

interface Topic {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  lessons: Lesson[];
}

const LessonsPage: React.FC<LessonsPageProps> = ({ user, onOpenAuth, onReadVerse }) => {
  // Persisted to user_data; localStorage is an offline cache.
  const [completedLessons, setCompletedLessons] = useSyncedState<string[]>(
    'sog-completed-lessons', 'completed_lessons', [], user);

  const [currentLessonProgress, setCurrentLessonProgress] = useSyncedState<Record<string, number>>(
    'sog-lesson-progress', 'lesson_progress', {}, user);

  const [expandedTopic, setExpandedTopic] = useState<string | null>('sonship');
  const [selectedLesson, setSelectedLesson] = useState<{ topic: Topic; lesson: Lesson } | null>(null);
  const [lessonStep, setLessonStep] = useState(0);

  const topics: Topic[] = [
    {
      id: 'sonship',
      title: 'Understanding Sonship',
      subtitle: 'Discover Your Identity as a Child of God',
      description: 'Explore what it means to be adopted into God\'s family and live as His beloved child.',
      icon: <Crown className="w-6 h-6" />,
      color: 'text-[#F59E0B]',
      bgGradient: 'from-[#F59E0B]/20 to-[#D97706]/10',
      lessons: [
        {
          id: 'sonship-1',
          title: 'The Spirit of Adoption',
          description: 'Learn how the Holy Spirit confirms our identity as God\'s children and frees us from the spirit of fear.',
          duration: '15 min',
          scriptures: ['Romans 8:14-17', 'Galatians 4:4-7', 'Ephesians 1:5'],
          objectives: [
            'Understand the difference between slavery and sonship',
            'Recognize the Holy Spirit\'s role in our adoption',
            'Learn to cry "Abba, Father" with confidence'
          ],
          content: `The journey into sonship begins with understanding that God has not given us a spirit of fear, but of adoption. Through Christ, we have been brought into the family of God—not as servants, but as beloved children.

In Romans 8:15, Paul writes: "For you did not receive the spirit of slavery to fall back into fear, but you have received the Spirit of adoption as sons, by whom we cry, 'Abba! Father!'"

This is revolutionary! The same Spirit that raised Christ from the dead now dwells in us, testifying that we are children of God. We are no longer outsiders trying to earn God's favor—we are family members who have full access to the Father's presence.`
        },
        {
          id: 'sonship-2',
          title: 'Heirs with Christ',
          description: 'Discover the incredible inheritance that belongs to every child of God.',
          duration: '20 min',
          scriptures: ['Romans 8:17', 'Galatians 3:29', '1 Peter 1:3-5'],
          objectives: [
            'Understand what it means to be co-heirs with Christ',
            'Discover the nature of our spiritual inheritance',
            'Learn to live from a place of abundance, not lack'
          ],
          content: `As children of God, we are not just family members—we are heirs. Romans 8:17 declares: "And if children, then heirs—heirs of God and fellow heirs with Christ."

Think about that! Everything that belongs to Christ belongs to us. His righteousness, His authority, His access to the Father, His victory over sin and death—all of it is our inheritance.

Peter describes this inheritance as "imperishable, undefiled, and unfading, kept in heaven for you" (1 Peter 1:4). This isn't something we might receive someday—it's already ours in Christ.`
        },
        {
          id: 'sonship-3',
          title: 'From Orphan to Son',
          description: 'Break free from orphan thinking and embrace your true identity.',
          duration: '25 min',
          scriptures: ['John 14:18', 'Luke 15:11-32', 'Galatians 4:1-7'],
          objectives: [
            'Identify orphan mindset patterns',
            'Understand the Father\'s heart toward you',
            'Begin walking in sonship confidence'
          ],
          content: `Jesus promised, "I will not leave you as orphans; I will come to you" (John 14:18). Yet many believers still live with an orphan mentality—striving for approval, fearing rejection, and feeling like outsiders in God's family.

The parable of the prodigal son reveals the Father's heart. When the son returned, the father didn't lecture him or put him on probation. Instead, he ran to embrace him, clothed him with the best robe, and threw a celebration.

This is how your Heavenly Father sees you. You don't have to earn your place in His family—you already have it through Christ.`
        },
        {
          id: 'sonship-4',
          title: 'Living as Sons and Daughters',
          description: 'Practical steps to walk daily in your identity as God\'s child.',
          duration: '20 min',
          scriptures: ['1 John 3:1-3', '2 Corinthians 6:18', 'Philippians 2:14-15'],
          objectives: [
            'Develop daily practices that reinforce your identity',
            'Learn to approach God with confidence',
            'Shine as a child of light in the world'
          ],
          content: `"See what kind of love the Father has given to us, that we should be called children of God; and so we are!" (1 John 3:1)

Living as sons and daughters isn't about trying harder—it's about believing deeper. When we truly understand who we are in Christ, our behavior naturally aligns with our identity.

Start each day by declaring: "I am a beloved child of God. I have full access to my Father. I am accepted, loved, and secure in His family." Let this truth transform how you pray, how you face challenges, and how you relate to others.`
        }
      ]
    },
    {
      id: 'spirit',
      title: 'Walking in the Spirit',
      subtitle: 'Living by the Power of the Holy Spirit',
      description: 'Learn to be led by the Spirit in every area of your life and experience His transforming power.',
      icon: <Flame className="w-6 h-6" />,
      color: 'text-[#14B8A6]',
      bgGradient: 'from-[#14B8A6]/20 to-[#0D9488]/10',
      lessons: [
        {
          id: 'spirit-1',
          title: 'The Indwelling Spirit',
          description: 'Understand the gift of the Holy Spirit living within you.',
          duration: '15 min',
          scriptures: ['John 14:16-17', '1 Corinthians 6:19', 'Romans 8:9-11'],
          objectives: [
            'Recognize the Holy Spirit as a Person, not just a force',
            'Understand what it means to be a temple of the Spirit',
            'Learn to cultivate awareness of His presence'
          ],
          content: `Jesus promised His disciples: "I will ask the Father, and he will give you another Helper, to be with you forever, even the Spirit of truth" (John 14:16-17).

The Holy Spirit is not an impersonal force—He is God Himself dwelling within you. Paul reminds us: "Do you not know that your body is a temple of the Holy Spirit within you?" (1 Corinthians 6:19)

This changes everything. You are never alone. The same Spirit who hovered over the waters at creation, who empowered the prophets, who raised Jesus from the dead—He lives in you!`
        },
        {
          id: 'spirit-2',
          title: 'Led by the Spirit',
          description: 'Learn to recognize and follow the Spirit\'s guidance in daily life.',
          duration: '20 min',
          scriptures: ['Romans 8:14', 'Galatians 5:16-18', 'John 16:13'],
          objectives: [
            'Distinguish between flesh and Spirit promptings',
            'Develop sensitivity to the Spirit\'s leading',
            'Practice following His guidance in decisions'
          ],
          content: `"For all who are led by the Spirit of God are sons of God" (Romans 8:14). Being led by the Spirit is a defining characteristic of God's children.

The Spirit leads us in many ways: through Scripture, through inner promptings, through wise counsel, through circumstances, and through peace (or lack of it). Learning to recognize His voice takes time and practice.

Paul instructs us to "walk by the Spirit, and you will not gratify the desires of the flesh" (Galatians 5:16). This is an active, ongoing choice to yield to the Spirit's direction rather than our natural impulses.`
        },
        {
          id: 'spirit-3',
          title: 'The Fruit of the Spirit',
          description: 'Cultivate the character of Christ through the Spirit\'s work in you.',
          duration: '25 min',
          scriptures: ['Galatians 5:22-23', 'John 15:4-5', 'Colossians 3:12-14'],
          objectives: [
            'Understand each aspect of the fruit of the Spirit',
            'Learn how fruit is produced (abiding, not striving)',
            'Identify areas for growth in your character'
          ],
          content: `"But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control" (Galatians 5:22-23).

Notice it's called "fruit," not "works." Fruit grows naturally when a branch is connected to the vine. Jesus said, "Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine, neither can you, unless you abide in me" (John 15:4).

We don't produce spiritual fruit through self-effort. We produce it by staying connected to Jesus and yielding to the Spirit's transforming work within us.`
        },
        {
          id: 'spirit-4',
          title: 'Empowered for Service',
          description: 'Discover the Spirit\'s gifts and power for ministry.',
          duration: '20 min',
          scriptures: ['Acts 1:8', '1 Corinthians 12:4-11', 'Ephesians 3:16-20'],
          objectives: [
            'Understand the purpose of spiritual gifts',
            'Discover how the Spirit empowers witness',
            'Learn to minister in the Spirit\'s power'
          ],
          content: `Jesus told His disciples: "You will receive power when the Holy Spirit has come upon you, and you will be my witnesses" (Acts 1:8).

The Spirit doesn't just transform our character—He empowers us for service. He gives gifts to each believer "for the common good" (1 Corinthians 12:7). These gifts aren't for our own glory but to build up the body of Christ and reach the lost.

Paul prayed that believers would be "strengthened with power through his Spirit in your inner being" (Ephesians 3:16). This power is available to you today!`
        }
      ]
    },
    {
      id: 'identity',
      title: 'Divine Identity',
      subtitle: 'Who You Are in Christ',
      description: 'Discover the truth about who God says you are and break free from false identities.',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'text-[#8B5CF6]',
      bgGradient: 'from-[#8B5CF6]/20 to-[#7C3AED]/10',
      lessons: [
        {
          id: 'identity-1',
          title: 'A New Creation',
          description: 'Understand the radical transformation that happened when you came to Christ.',
          duration: '15 min',
          scriptures: ['2 Corinthians 5:17', 'Ephesians 2:1-10', 'Colossians 3:1-4'],
          objectives: [
            'Grasp the reality of spiritual rebirth',
            'Understand your position "in Christ"',
            'Begin seeing yourself as God sees you'
          ],
          content: `"Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come" (2 Corinthians 5:17).

When you came to Christ, something supernatural happened. You didn't just get a fresh start or turn over a new leaf—you became an entirely new person. The old you died with Christ; a new you was raised with Him.

Paul says we were "dead in trespasses and sins" but God "made us alive together with Christ" (Ephesians 2:1, 5). This isn't metaphor—it's spiritual reality. Your identity is no longer defined by your past, your failures, or your family history. You are defined by Christ.`
        },
        {
          id: 'identity-2',
          title: 'Chosen and Beloved',
          description: 'Rest in God\'s unconditional love and sovereign choice.',
          duration: '20 min',
          scriptures: ['Ephesians 1:3-6', '1 Peter 2:9', 'Colossians 3:12'],
          objectives: [
            'Understand election as an expression of love',
            'Know that you are chosen, not accidental',
            'Live from acceptance, not for acceptance'
          ],
          content: `"He chose us in him before the foundation of the world, that we should be holy and blameless before him. In love he predestined us for adoption" (Ephesians 1:4-5).

Before time began, God knew you and chose you. You are not an accident or an afterthought. You are intentionally, purposefully, lovingly chosen.

Peter calls believers "a chosen race, a royal priesthood, a holy nation, a people for his own possession" (1 Peter 2:9). This is your identity! You belong to God. You are His treasured possession.`
        },
        {
          id: 'identity-3',
          title: 'Righteous in Christ',
          description: 'Embrace the gift of righteousness and live free from condemnation.',
          duration: '20 min',
          scriptures: ['Romans 5:17', '2 Corinthians 5:21', 'Romans 8:1'],
          objectives: [
            'Understand imputed righteousness',
            'Break free from performance-based identity',
            'Walk in freedom from condemnation'
          ],
          content: `"For our sake he made him to be sin who knew no sin, so that in him we might become the righteousness of God" (2 Corinthians 5:21).

This is the great exchange: Jesus took our sin so we could receive His righteousness. Not our own righteousness—His! We are not just forgiven sinners; we are declared righteous.

Romans 8:1 proclaims: "There is therefore now no condemnation for those who are in Christ Jesus." When God looks at you, He sees the righteousness of Christ. You are fully accepted, completely loved, totally secure.`
        },
        {
          id: 'identity-4',
          title: 'Seated in Heavenly Places',
          description: 'Understand your spiritual position and authority in Christ.',
          duration: '25 min',
          scriptures: ['Ephesians 2:6', 'Colossians 3:1-3', 'Ephesians 1:19-23'],
          objectives: [
            'Grasp your position of authority in Christ',
            'Learn to live from victory, not for victory',
            'Exercise your spiritual authority'
          ],
          content: `"And raised us up with him and seated us with him in the heavenly places in Christ Jesus" (Ephesians 2:6).

Right now, spiritually speaking, you are seated with Christ at the right hand of the Father. This isn't future tense—it's present reality. You are positioned above every principality and power.

Paul prays that we would know "the immeasurable greatness of his power toward us who believe" (Ephesians 1:19). The same power that raised Christ and seated Him above all rule and authority is at work in you!`
        }
      ]
    },
    {
      id: 'faith',
      title: 'Living by Faith',
      subtitle: 'Trusting God in Every Season',
      description: 'Develop unshakeable faith that pleases God and moves mountains.',
      icon: <Target className="w-6 h-6" />,
      color: 'text-[#3B82F6]',
      bgGradient: 'from-[#3B82F6]/20 to-[#2563EB]/10',
      lessons: [
        {
          id: 'faith-1',
          title: 'The Nature of Faith',
          description: 'Understand what biblical faith really is and how it works.',
          duration: '15 min',
          scriptures: ['Hebrews 11:1', 'Hebrews 11:6', 'Romans 10:17'],
          objectives: [
            'Define faith according to Scripture',
            'Understand faith as substance and evidence',
            'Learn how faith comes and grows'
          ],
          content: `"Now faith is the substance of things hoped for, the evidence of things not seen" (Hebrews 11:1 KJV).

Faith is not wishful thinking or positive vibes. It is confident trust in God's character and promises. It treats God's Word as more real than our circumstances.

"Without faith it is impossible to please him, for whoever would draw near to God must believe that he exists and that he rewards those who seek him" (Hebrews 11:6). Faith is essential to our relationship with God.`
        },
        {
          id: 'faith-2',
          title: 'Faith That Overcomes',
          description: 'Learn to stand firm in faith during trials and opposition.',
          duration: '20 min',
          scriptures: ['1 John 5:4', 'James 1:2-4', '1 Peter 1:6-7'],
          objectives: [
            'Understand the role of trials in faith development',
            'Learn to rejoice in testing',
            'Develop overcoming faith'
          ],
          content: `"For everyone who has been born of God overcomes the world. And this is the victory that has overcome the world—our faith" (1 John 5:4).

Faith is not the absence of trials—it's victory in the midst of them. James tells us to "count it all joy" when we face trials because testing produces steadfastness (James 1:2-3).

Peter says our faith is "more precious than gold that perishes though it is tested by fire" (1 Peter 1:7). Every trial is an opportunity for your faith to be refined and strengthened.`
        },
        {
          id: 'faith-3',
          title: 'Speaking Faith',
          description: 'Discover the power of faith-filled words.',
          duration: '20 min',
          scriptures: ['Mark 11:22-24', 'Romans 4:17', 'Proverbs 18:21'],
          objectives: [
            'Understand the connection between faith and speech',
            'Learn to speak God\'s promises',
            'Align your words with God\'s Word'
          ],
          content: `Jesus said, "Have faith in God. Truly, I say to you, whoever says to this mountain, 'Be taken up and thrown into the sea,' and does not doubt in his heart, but believes that what he says will come to pass, it will be done for him" (Mark 11:22-23).

Faith speaks. Abraham's faith was demonstrated when he called "into existence the things that do not exist" (Romans 4:17). He called himself "father of many nations" before he had a single child.

Your words matter. "Death and life are in the power of the tongue" (Proverbs 18:21). Speak what God says about your situation, not what your circumstances say.`
        },
        {
          id: 'faith-4',
          title: 'Walking by Faith',
          description: 'Practical steps to live a faith-filled life daily.',
          duration: '20 min',
          scriptures: ['2 Corinthians 5:7', 'Habakkuk 2:4', 'Galatians 2:20'],
          objectives: [
            'Develop daily faith practices',
            'Learn to trust God in uncertainty',
            'Live by faith, not by sight'
          ],
          content: `"For we walk by faith, not by sight" (2 Corinthians 5:7).

Walking by faith means making decisions based on God's Word rather than our circumstances. It means trusting His promises when everything looks impossible.

Paul declared, "The life I now live in the flesh I live by faith in the Son of God, who loved me and gave himself for me" (Galatians 2:20). Faith isn't just for crisis moments—it's a way of life.`
        }
      ]
    },
    {
      id: 'purpose',
      title: 'Divine Purpose',
      subtitle: 'Discovering God\'s Plan for Your Life',
      description: 'Uncover your unique calling and learn to walk in the good works God prepared for you.',
      icon: <Zap className="w-6 h-6" />,
      color: 'text-[#EC4899]',
      bgGradient: 'from-[#EC4899]/20 to-[#DB2777]/10',
      lessons: [
        {
          id: 'purpose-1',
          title: 'Created for Good Works',
          description: 'Discover that God has prepared specific works for you to do.',
          duration: '15 min',
          scriptures: ['Ephesians 2:10', 'Jeremiah 29:11', 'Psalm 139:13-16'],
          objectives: [
            'Understand you are God\'s masterpiece',
            'Recognize God\'s intentional design for your life',
            'Begin discovering your prepared works'
          ],
          content: `"For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand, that we should walk in them" (Ephesians 2:10).

You are not random. You are God's "workmanship"—His masterpiece, His poem (the Greek word is "poiema"). Before you were born, God prepared specific good works for you to accomplish.

Psalm 139 reveals that God formed you in your mother's womb and wrote all your days in His book before one of them came to be. You have a divine purpose!`
        },
        {
          id: 'purpose-2',
          title: 'Gifts and Calling',
          description: 'Identify your spiritual gifts and understand your unique calling.',
          duration: '25 min',
          scriptures: ['Romans 12:4-8', '1 Corinthians 12:12-27', '1 Peter 4:10-11'],
          objectives: [
            'Identify your spiritual gifts',
            'Understand how gifts serve the body',
            'Begin operating in your gifts'
          ],
          content: `"Having gifts that differ according to the grace given to us, let us use them" (Romans 12:6).

God has given every believer spiritual gifts—supernatural abilities to serve others and build up the church. These gifts are not earned; they are grace gifts given by the Spirit.

Peter instructs: "As each has received a gift, use it to serve one another, as good stewards of God's varied grace" (1 Peter 4:10). Your gifts are meant to be used, not hidden!`
        },
        {
          id: 'purpose-3',
          title: 'The Great Commission',
          description: 'Embrace your role in God\'s global mission.',
          duration: '20 min',
          scriptures: ['Matthew 28:18-20', 'Acts 1:8', '2 Corinthians 5:18-20'],
          objectives: [
            'Understand the Great Commission',
            'See yourself as an ambassador for Christ',
            'Find your place in God\'s mission'
          ],
          content: `"Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you" (Matthew 28:19-20).

Every believer is called to participate in the Great Commission. We are "ambassadors for Christ, God making his appeal through us" (2 Corinthians 5:20).

You may not be called to go overseas, but you are called to make disciples wherever you are. Your workplace, neighborhood, and family are your mission field.`
        },
        {
          id: 'purpose-4',
          title: 'Faithful in Little',
          description: 'Learn to steward your current season well.',
          duration: '20 min',
          scriptures: ['Luke 16:10-12', 'Matthew 25:14-30', 'Colossians 3:23-24'],
          objectives: [
            'Understand the principle of faithful stewardship',
            'Learn to serve wholeheartedly in your current role',
            'Prepare for greater responsibility'
          ],
          content: `"One who is faithful in a very little is also faithful in much" (Luke 16:10).

God tests our faithfulness in small things before entrusting us with greater things. The parable of the talents shows that those who were faithful with what they had received more.

Whatever your current role—student, employee, parent, volunteer—do it "heartily, as for the Lord" (Colossians 3:23). Your faithfulness today is preparation for tomorrow's calling.`
        }
      ]
    },
    {
      id: 'community',
      title: 'Life in Community',
      subtitle: 'Growing Together in Christ',
      description: 'Understand the importance of Christian community and learn to love one another well.',
      icon: <Users className="w-6 h-6" />,
      color: 'text-[#10B981]',
      bgGradient: 'from-[#10B981]/20 to-[#059669]/10',
      lessons: [
        {
          id: 'community-1',
          title: 'The Body of Christ',
          description: 'Understand your place in the family of believers.',
          duration: '15 min',
          scriptures: ['1 Corinthians 12:12-27', 'Ephesians 4:15-16', 'Romans 12:4-5'],
          objectives: [
            'Understand the body metaphor',
            'Recognize your unique role in the body',
            'Value every member\'s contribution'
          ],
          content: `"For just as the body is one and has many members, and all the members of the body, though many, are one body, so it is with Christ" (1 Corinthians 12:12).

You are not meant to live the Christian life alone. You are part of a body—connected to other believers, dependent on them, and needed by them.

Every part of the body matters. "The eye cannot say to the hand, 'I have no need of you'" (1 Corinthians 12:21). You have a unique role that no one else can fill!`
        },
        {
          id: 'community-2',
          title: 'One Another Commands',
          description: 'Learn the practical ways Scripture calls us to love each other.',
          duration: '20 min',
          scriptures: ['John 13:34-35', 'Galatians 6:2', 'Hebrews 10:24-25'],
          objectives: [
            'Study the "one another" commands',
            'Develop practical love for believers',
            'Commit to consistent fellowship'
          ],
          content: `"A new commandment I give to you, that you love one another: just as I have loved you, you also are to love one another" (John 13:34).

The New Testament contains over 50 "one another" commands: love one another, encourage one another, bear one another's burdens, forgive one another, serve one another...

These aren't suggestions—they're essential to Christian living. We need each other. "Let us consider how to stir up one another to love and good works, not neglecting to meet together" (Hebrews 10:24-25).`
        },
        {
          id: 'community-3',
          title: 'Unity in Diversity',
          description: 'Celebrate differences while maintaining the bond of peace.',
          duration: '20 min',
          scriptures: ['Ephesians 4:1-6', 'Galatians 3:28', 'Colossians 3:11-14'],
          objectives: [
            'Value diversity in the body',
            'Maintain unity despite differences',
            'Put on love as the bond of perfection'
          ],
          content: `"There is one body and one Spirit—just as you were called to the one hope that belongs to your call—one Lord, one faith, one baptism, one God and Father of all" (Ephesians 4:4-6).

The church is beautifully diverse—different backgrounds, personalities, gifts, and perspectives. Yet we are called to "maintain the unity of the Spirit in the bond of peace" (Ephesians 4:3).

In Christ, "there is neither Jew nor Greek, there is neither slave nor free, there is no male and female, for you are all one in Christ Jesus" (Galatians 3:28). Our unity is in Him!`
        },
        {
          id: 'community-4',
          title: 'Accountability and Growth',
          description: 'Embrace the blessing of spiritual accountability.',
          duration: '20 min',
          scriptures: ['Proverbs 27:17', 'James 5:16', 'Ecclesiastes 4:9-12'],
          objectives: [
            'Understand the value of accountability',
            'Learn to give and receive correction',
            'Build relationships that promote growth'
          ],
          content: `"Iron sharpeneth iron; so a man sharpeneth the countenance of his friend" (Proverbs 27:17 KJV 1611).

We grow faster and stronger when we're in accountable relationships. James instructs: "Confess your faults one to another, and pray one for another, that ye may be healed" (James 5:16 KJV 1611).

"Two are better than one... For if they fall, the one will lift up his fellow: but woe to him that is alone when he falleth; for he hath not another to help him up!" (Ecclesiastes 4:9-10 KJV 1611). Find someone to walk with!`

        }
      ]
    }
  ];

  const getTotalLessons = () => topics.reduce((acc, topic) => acc + topic.lessons.length, 0);
  
  const getCompletedCount = () => completedLessons.length;
  
  const getTopicProgress = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return 0;
    const completed = topic.lessons.filter(l => completedLessons.includes(l.id)).length;
    return Math.round((completed / topic.lessons.length) * 100);
  };

  const isLessonCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  const isLessonUnlocked = (topicId: string, lessonIndex: number) => {
    if (lessonIndex === 0) return true;
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return false;
    const previousLesson = topic.lessons[lessonIndex - 1];
    return completedLessons.includes(previousLesson.id);
  };

  const handleStartLesson = (topic: Topic, lesson: Lesson) => {
    setSelectedLesson({ topic, lesson });
    setLessonStep(0);
  };

  const handleCompleteLesson = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId]);
    }
    setSelectedLesson(null);
    setLessonStep(0);
  };

  const handleNextStep = () => {
    setLessonStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setLessonStep(prev => Math.max(0, prev - 1));
  };

  // Lesson View
  if (selectedLesson) {
    const { topic, lesson } = selectedLesson;
    const steps = ['Introduction', 'Scripture Study', 'Key Takeaways', 'Reflection'];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedLesson(null)}
            className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Back to Lessons</span>
          </button>

          {/* Lesson Header */}
          <div className={`bg-gradient-to-br ${topic.bgGradient} border border-white/10 rounded-2xl p-6 sm:p-8 mb-8`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic.bgGradient} flex items-center justify-center ${topic.color}`}>
                {topic.icon}
              </div>
              <span className={`text-sm font-medium ${topic.color}`}>{topic.title}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
              {lesson.title}
            </h1>
            <p className="text-white/70">{lesson.description}</p>
            <div className="flex items-center space-x-4 mt-4 text-sm text-white/50">
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.duration}</span>
              </span>
              <span className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{lesson.scriptures.length} passages</span>
              </span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    index < lessonStep 
                      ? 'bg-[#14B8A6] text-white' 
                      : index === lessonStep 
                        ? `bg-gradient-to-br ${topic.bgGradient} ${topic.color} border-2 border-current` 
                        : 'bg-white/10 text-white/40'
                  }`}>
                    {index < lessonStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 hidden sm:block ${
                    index <= lessonStep ? 'text-white/80' : 'text-white/40'
                  }`}>
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full ${
                    index < lessonStep ? 'bg-[#14B8A6]' : 'bg-white/10'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Lesson Content */}
          <div className="bg-gradient-to-br from-[#14B8A6]/5 via-[#0f2942] to-[#3B82F6]/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
            {lessonStep === 0 && (
              <div>
                <h2 className="text-xl font-serif font-bold text-white mb-4">Introduction</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/80 whitespace-pre-line leading-relaxed">
                    {lesson.content}
                  </p>
                </div>
              </div>
            )}

            {lessonStep === 1 && (
              <div>
                <h2 className="text-xl font-serif font-bold text-white mb-4">Scripture Study</h2>
                <p className="text-white/60 mb-6">Read and meditate on these key passages:</p>
                <div className="space-y-4">
                  {lesson.scriptures.map((scripture, index) => (
                    <button
                      key={index}
                      onClick={() => onReadVerse(scripture)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center">
                          <BookMarked className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                        <span className="text-white font-medium">{scripture}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lessonStep === 2 && (
              <div>
                <h2 className="text-xl font-serif font-bold text-white mb-4">Key Takeaways</h2>
                <p className="text-white/60 mb-6">Learning objectives for this lesson:</p>
                <div className="space-y-4">
                  {lesson.objectives.map((objective, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className={`w-8 h-8 rounded-lg ${topic.bgGradient} flex items-center justify-center flex-shrink-0`}>
                        <CheckCircle2 className={`w-4 h-4 ${topic.color}`} />
                      </div>
                      <span className="text-white/80">{objective}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lessonStep === 3 && (
              <div>
                <h2 className="text-xl font-serif font-bold text-white mb-4">Reflection & Application</h2>
                <p className="text-white/60 mb-6">Take a moment to reflect on what you've learned:</p>
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <label className="block text-white/80 mb-2 font-medium">
                      What stood out to you most from this lesson?
                    </label>
                    <textarea
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6]/50"
                      placeholder="Write your thoughts..."
                    />
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <label className="block text-white/80 mb-2 font-medium">
                      How will you apply this truth to your life this week?
                    </label>
                    <textarea
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6]/50"
                      placeholder="Write your application..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevStep}
              disabled={lessonStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                lessonStep === 0
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              <span>Previous</span>
            </button>

            {lessonStep < 3 ? (
              <button
                onClick={handleNextStep}
                className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${
                  topic.id === 'sonship' ? 'from-[#F59E0B] to-[#D97706]' :
                  topic.id === 'spirit' ? 'from-[#14B8A6] to-[#0D9488]' :
                  topic.id === 'identity' ? 'from-[#8B5CF6] to-[#7C3AED]' :
                  topic.id === 'faith' ? 'from-[#3B82F6] to-[#2563EB]' :
                  topic.id === 'purpose' ? 'from-[#EC4899] to-[#DB2777]' :
                  'from-[#10B981] to-[#059669]'
                } text-white font-medium rounded-xl hover:opacity-90 transition-all`}
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => handleCompleteLesson(lesson.id)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-medium rounded-xl hover:opacity-90 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Lesson</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://d64gsuwffb70l.cloudfront.net/695528f5022ffb066b447b69_1767595764558_a78c7997.jpg"
            alt="Spiritual Growth"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c1929]/80 via-[#0f2942]/90 to-[#0c1929]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#F59E0B]/20 border border-[#F59E0B]/30 rounded-full mb-6">
              <GraduationCap className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-[#F59E0B] font-medium">Spiritual Growth Lessons</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
              Grow in Your Faith
            </h1>
            
            <p className="text-lg sm:text-xl text-white/70 mb-8">
              Structured Bible study lessons designed to deepen your understanding of God's Word 
              and transform your walk with Christ.
            </p>

            {/* Progress Overview */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-xl">
                <BookOpen className="w-5 h-5 text-[#14B8A6]" />
                <span className="text-white">
                  <span className="font-bold">{getTotalLessons()}</span> Lessons
                </span>
              </div>
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-[#F59E0B]" />
                <span className="text-white">
                  <span className="font-bold">{getCompletedCount()}</span> Completed
                </span>
              </div>
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-xl">
                <Award className="w-5 h-5 text-[#8B5CF6]" />
                <span className="text-white">
                  <span className="font-bold">{Math.round((getCompletedCount() / getTotalLessons()) * 100)}%</span> Progress
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden"
            >
              {/* Topic Header */}
              <button
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${topic.bgGradient} flex items-center justify-center ${topic.color}`}>
                    {topic.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-serif font-bold text-white">{topic.title}</h3>
                    <p className="text-white/60 text-sm">{topic.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Progress Bar */}
                  <div className="hidden sm:flex items-center space-x-3">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${
                          topic.id === 'sonship' ? 'from-[#F59E0B] to-[#D97706]' :
                          topic.id === 'spirit' ? 'from-[#14B8A6] to-[#0D9488]' :
                          topic.id === 'identity' ? 'from-[#8B5CF6] to-[#7C3AED]' :
                          topic.id === 'faith' ? 'from-[#3B82F6] to-[#2563EB]' :
                          topic.id === 'purpose' ? 'from-[#EC4899] to-[#DB2777]' :
                          'from-[#10B981] to-[#059669]'
                        } transition-all duration-500`}
                        style={{ width: `${getTopicProgress(topic.id)}%` }}
                      />
                    </div>
                    <span className="text-white/60 text-sm w-12">{getTopicProgress(topic.id)}%</span>
                  </div>
                  {expandedTopic === topic.id ? (
                    <ChevronUp className="w-6 h-6 text-white/60" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-white/60" />
                  )}
                </div>
              </button>

              {/* Expanded Lessons */}
              {expandedTopic === topic.id && (
                <div className="px-6 pb-6">
                  <p className="text-white/60 mb-6">{topic.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topic.lessons.map((lesson, index) => {
                      const completed = isLessonCompleted(lesson.id);
                      const unlocked = isLessonUnlocked(topic.id, index);
                      
                      return (
                        <div
                          key={lesson.id}
                          className={`relative p-5 rounded-xl border transition-all ${
                            completed
                              ? 'bg-[#14B8A6]/10 border-[#14B8A6]/30'
                              : unlocked
                                ? 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 cursor-pointer'
                                : 'bg-white/[0.02] border-white/5 opacity-60'
                          }`}
                          onClick={() => unlocked && !completed && handleStartLesson(topic, lesson)}
                        >
                          {/* Lesson Number Badge */}
                          <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            completed
                              ? 'bg-[#14B8A6] text-white'
                              : unlocked
                                ? `bg-gradient-to-br ${topic.bgGradient} ${topic.color}`
                                : 'bg-white/10 text-white/40'
                          }`}>
                            {completed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                          </div>

                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-4">
                              <h4 className={`font-semibold mb-1 ${completed ? 'text-[#14B8A6]' : 'text-white'}`}>
                                {lesson.title}
                              </h4>
                              <p className="text-white/60 text-sm mb-3 line-clamp-2">
                                {lesson.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-white/50">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.duration}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <BookOpen className="w-3 h-3" />
                                  <span>{lesson.scriptures.length} passages</span>
                                </span>
                              </div>
                            </div>
                            
                            {/* Action Button */}
                            <div className="flex-shrink-0">
                              {completed ? (
                                <div className="w-10 h-10 rounded-full bg-[#14B8A6]/20 flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-[#14B8A6]" />
                                </div>
                              ) : unlocked ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartLesson(topic, lesson);
                                  }}
                                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${topic.bgGradient} flex items-center justify-center hover:scale-110 transition-transform`}
                                >
                                  <Play className={`w-5 h-5 ${topic.color}`} />
                                </button>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-white/30" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Section */}
      {getCompletedCount() > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-[#F59E0B]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#F59E0B]/20 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#14B8A6]/20 flex items-center justify-center">
              <Award className="w-10 h-10 text-[#F59E0B]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white mb-2">
              Keep Growing!
            </h3>
            <p className="text-white/70 mb-4">
              You've completed {getCompletedCount()} of {getTotalLessons()} lessons. 
              {getCompletedCount() === getTotalLessons() 
                ? " Congratulations on completing all lessons!" 
                : " Keep going to unlock more spiritual insights!"}
            </p>
            <div className="flex items-center justify-center space-x-2">
              {[...Array(Math.min(getCompletedCount(), 10))].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Call to Action for Non-Users */}
      {!user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-[#14B8A6]/10 to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-8 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-[#14B8A6]" />
            <h3 className="text-xl font-serif font-bold text-white mb-2">
              Sign In to Save Your Progress
            </h3>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              Create an account to track your lesson progress across devices and never lose your spiritual growth journey.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsPage;
