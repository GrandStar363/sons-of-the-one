// Bible books organized by testament
// Using the King James Version (KJV) 1611 - Authorized Version ONLY

export const bibleVersion = {
  name: 'King James Version 1611',
  abbreviation: 'KJV 1611',
  year: '1611',
  description: 'The Authorized King James Version of the Holy Bible (1611)',
};


export const oldTestament = [
  { name: 'Genesis', abbr: 'Gen', chapters: 50 },
  { name: 'Exodus', abbr: 'Exod', chapters: 40 },
  { name: 'Leviticus', abbr: 'Lev', chapters: 27 },
  { name: 'Numbers', abbr: 'Num', chapters: 36 },
  { name: 'Deuteronomy', abbr: 'Deut', chapters: 34 },
  { name: 'Joshua', abbr: 'Josh', chapters: 24 },
  { name: 'Judges', abbr: 'Judg', chapters: 21 },
  { name: 'Ruth', abbr: 'Ruth', chapters: 4 },
  { name: '1 Samuel', abbr: '1Sam', chapters: 31 },
  { name: '2 Samuel', abbr: '2Sam', chapters: 24 },
  { name: '1 Kings', abbr: '1Kgs', chapters: 22 },
  { name: '2 Kings', abbr: '2Kgs', chapters: 25 },
  { name: '1 Chronicles', abbr: '1Chr', chapters: 29 },
  { name: '2 Chronicles', abbr: '2Chr', chapters: 36 },
  { name: 'Ezra', abbr: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', abbr: 'Neh', chapters: 13 },
  { name: 'Esther', abbr: 'Esth', chapters: 10 },
  { name: 'Job', abbr: 'Job', chapters: 42 },
  { name: 'Psalms', abbr: 'Ps', chapters: 150 },
  { name: 'Proverbs', abbr: 'Prov', chapters: 31 },
  { name: 'Ecclesiastes', abbr: 'Eccl', chapters: 12 },
  { name: 'Song of Solomon', abbr: 'Song', chapters: 8 },
  { name: 'Isaiah', abbr: 'Isa', chapters: 66 },
  { name: 'Jeremiah', abbr: 'Jer', chapters: 52 },
  { name: 'Lamentations', abbr: 'Lam', chapters: 5 },
  { name: 'Ezekiel', abbr: 'Ezek', chapters: 48 },
  { name: 'Daniel', abbr: 'Dan', chapters: 12 },
  { name: 'Hosea', abbr: 'Hos', chapters: 14 },
  { name: 'Joel', abbr: 'Joel', chapters: 3 },
  { name: 'Amos', abbr: 'Amos', chapters: 9 },
  { name: 'Obadiah', abbr: 'Obad', chapters: 1 },
  { name: 'Jonah', abbr: 'Jonah', chapters: 4 },
  { name: 'Micah', abbr: 'Mic', chapters: 7 },
  { name: 'Nahum', abbr: 'Nah', chapters: 3 },
  { name: 'Habakkuk', abbr: 'Hab', chapters: 3 },
  { name: 'Zephaniah', abbr: 'Zeph', chapters: 3 },
  { name: 'Haggai', abbr: 'Hag', chapters: 2 },
  { name: 'Zechariah', abbr: 'Zech', chapters: 14 },
  { name: 'Malachi', abbr: 'Mal', chapters: 4 },
];

export const newTestament = [
  { name: 'Matthew', abbr: 'Matt', chapters: 28 },
  { name: 'Mark', abbr: 'Mark', chapters: 16 },
  { name: 'Luke', abbr: 'Luke', chapters: 24 },
  { name: 'John', abbr: 'John', chapters: 21 },
  { name: 'Acts', abbr: 'Acts', chapters: 28 },
  { name: 'Romans', abbr: 'Rom', chapters: 16 },
  { name: '1 Corinthians', abbr: '1Cor', chapters: 16 },
  { name: '2 Corinthians', abbr: '2Cor', chapters: 13 },
  { name: 'Galatians', abbr: 'Gal', chapters: 6 },
  { name: 'Ephesians', abbr: 'Eph', chapters: 6 },
  { name: 'Philippians', abbr: 'Phil', chapters: 4 },
  { name: 'Colossians', abbr: 'Col', chapters: 4 },
  { name: '1 Thessalonians', abbr: '1Thess', chapters: 5 },
  { name: '2 Thessalonians', abbr: '2Thess', chapters: 3 },
  { name: '1 Timothy', abbr: '1Tim', chapters: 6 },
  { name: '2 Timothy', abbr: '2Tim', chapters: 4 },
  { name: 'Titus', abbr: 'Titus', chapters: 3 },
  { name: 'Philemon', abbr: 'Phlm', chapters: 1 },
  { name: 'Hebrews', abbr: 'Heb', chapters: 13 },
  { name: 'James', abbr: 'Jas', chapters: 5 },
  { name: '1 Peter', abbr: '1Pet', chapters: 5 },
  { name: '2 Peter', abbr: '2Pet', chapters: 3 },
  { name: '1 John', abbr: '1John', chapters: 5 },
  { name: '2 John', abbr: '2John', chapters: 1 },
  { name: '3 John', abbr: '3John', chapters: 1 },
  { name: 'Jude', abbr: 'Jude', chapters: 1 },
  { name: 'Revelation', abbr: 'Rev', chapters: 22 },
];

export const allBooks = [...oldTestament, ...newTestament];

// Featured verses for daily rotation - KJV 1611
export const featuredVerses = [
  {
    reference: 'Romans 8:14',
    text: 'For as many as are led by the Spirit of God, they are the sons of God.',
    theme: 'Sonship',
  },
  {
    reference: 'Romans 8:29',
    text: 'For whom he did foreknow, he also did predestinate to be conformed to the image of his Son, that he might be the firstborn among many brethren.',
    theme: 'Firstborn',
  },
  {
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    theme: 'Salvation',
  },
  {
    reference: 'Galatians 3:26',
    text: 'For ye are all the children of God by faith in Christ Jesus.',
    theme: 'Faith',
  },
  {
    reference: 'Romans 8:16-17',
    text: 'The Spirit itself beareth witness with our spirit, that we are the children of God: And if children, then heirs; heirs of God, and joint-heirs with Christ; if so be that we suffer with him, that we may be also glorified together.',
    theme: 'Inheritance',
  },
  {
    reference: '1 John 3:1',
    text: 'Behold, what manner of love the Father hath bestowed upon us, that we should be called the sons of God: therefore the world knoweth us not, because it knew him not.',
    theme: 'Love',
  },
  {
    reference: 'Colossians 1:15',
    text: 'Who is the image of the invisible God, the firstborn of every creature.',
    theme: 'Christ',
  },
  {
    reference: 'Hebrews 2:10',
    text: 'For it became him, for whom are all things, and by whom are all things, in bringing many sons unto glory, to make the captain of their salvation perfect through sufferings.',
    theme: 'Glory',
  },
  {
    reference: 'John 1:12',
    text: 'But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name.',
    theme: 'Adoption',
  },
  {
    reference: 'Ephesians 1:5',
    text: 'Having predestinated us unto the adoption of children by Jesus Christ to himself, according to the good pleasure of his will.',
    theme: 'Predestination',
  },
  {
    reference: '2 Corinthians 6:18',
    text: 'And will be a Father unto you, and ye shall be my sons and daughters, saith the Lord Almighty.',
    theme: 'Promise',
  },
  {
    reference: 'Philippians 2:15',
    text: 'That ye may be blameless and harmless, the sons of God, without rebuke, in the midst of a crooked and perverse nation, among whom ye shine as lights in the world.',
    theme: 'Light',
  },
  {
    reference: 'Hebrews 11:1',
    text: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
    theme: 'Faith',
  },
  {
    reference: 'Ephesians 2:8-9',
    text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.',
    theme: 'Grace',
  },
  {
    reference: '1 John 3:2',
    text: 'Beloved, now are we the sons of God, and it doth not yet appear what we shall be: but we know that, when he shall appear, we shall be like him; for we shall see him as he is.',
    theme: 'Hope',
  },
  {
    reference: 'Romans 8:18',
    text: 'For I reckon that the sufferings of this present time are not worthy to be compared with the glory which shall be revealed in us.',
    theme: 'Glory',
  },
  {
    reference: 'Romans 8:31-32',
    text: 'What shall we then say to these things? If God be for us, who can be against us? He that spared not his own Son, but delivered him up for us all, how shall he not with him also freely give us all things?',
    theme: 'Promise',
  },
  // Baptism & New Life Scriptures - KJV 1611
  {
    reference: 'Romans 6:3-4',
    text: 'Know ye not, that so many of us as were baptized into Jesus Christ were baptized into his death? Therefore we are buried with him by baptism into death: that like as Christ was raised up from the dead by the glory of the Father, even so we also should walk in newness of life.',
    theme: 'Baptism',
  },
  {
    reference: 'Romans 6:6',
    text: 'Knowing this, that our old man is crucified with him, that the body of sin might be destroyed, that henceforth we should not serve sin.',
    theme: 'New Life',
  },
  {
    reference: 'Colossians 2:12',
    text: 'Buried with him in baptism, wherein also ye are risen with him through the faith of the operation of God, who hath raised him from the dead.',
    theme: 'Baptism',
  },
  {
    reference: '2 Corinthians 5:17',
    text: 'Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.',
    theme: 'New Creation',
  },
  {
    reference: 'Galatians 2:20',
    text: 'I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.',
    theme: 'New Life',
  },
  {
    reference: 'Ephesians 4:22-24',
    text: 'That ye put off concerning the former conversation the old man, which is corrupt according to the deceitful lusts; And be renewed in the spirit of your mind; And that ye put on the new man, which after God is created in righteousness and true holiness.',
    theme: 'Transformation',
  },
  {
    reference: 'Colossians 3:9-10',
    text: 'Lie not one to another, seeing that ye have put off the old man with his deeds; And have put on the new man, which is renewed in knowledge after the image of him that created him.',
    theme: 'New Life',
  },
  {
    reference: 'Titus 3:5',
    text: 'Not by works of righteousness which we have done, but according to his mercy he saved us, by the washing of regeneration, and renewing of the Holy Ghost.',
    theme: 'Regeneration',
  },
  {
    reference: '1 Peter 3:21',
    text: 'The like figure whereunto even baptism doth also now save us (not the putting away of the filth of the flesh, but the answer of a good conscience toward God,) by the resurrection of Jesus Christ.',
    theme: 'Baptism',
  },
  {
    reference: 'Acts 2:38',
    text: 'Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost.',
    theme: 'Baptism',
  },
  // Additional KJV verses
  {
    reference: 'Psalm 23:1',
    text: 'The LORD is my shepherd; I shall not want.',
    theme: 'Trust',
  },
  {
    reference: 'Proverbs 3:5-6',
    text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
    theme: 'Wisdom',
  },
  {
    reference: 'Isaiah 40:31',
    text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
    theme: 'Strength',
  },
  {
    reference: 'Jeremiah 29:11',
    text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
    theme: 'Hope',
  },
  {
    reference: 'Matthew 6:33',
    text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.',
    theme: 'Kingdom',
  },
  {
    reference: 'Romans 12:2',
    text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.',
    theme: 'Transformation',
  },
  {
    reference: 'Philippians 4:13',
    text: 'I can do all things through Christ which strengtheneth me.',
    theme: 'Strength',
  },
  {
    reference: 'Revelation 21:4',
    text: 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.',
    theme: 'Eternal Life',
  },

  // Additional KJV 1611 verses for daily rotation
  {
    reference: 'Joshua 1:9',
    text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
    theme: 'Courage',
  },
  {
    reference: 'Psalm 27:1',
    text: 'The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?',
    theme: 'Protection',
  },
  {
    reference: 'Psalm 46:1',
    text: 'God is our refuge and strength, a very present help in trouble.',
    theme: 'Refuge',
  },
  {
    reference: 'Psalm 91:1-2',
    text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.',
    theme: 'Protection',
  },
  {
    reference: 'Psalm 119:105',
    text: 'Thy word is a lamp unto my feet, and a light unto my path.',
    theme: 'Guidance',
  },
  {
    reference: 'Psalm 121:1-2',
    text: 'I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.',
    theme: 'Help',
  },
  {
    reference: 'Psalm 139:14',
    text: 'I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.',
    theme: 'Creation',
  },
  {
    reference: 'Isaiah 41:10',
    text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
    theme: 'Strength',
  },
  {
    reference: 'Isaiah 53:5',
    text: 'But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.',
    theme: 'Healing',
  },
  {
    reference: 'Lamentations 3:22-23',
    text: 'It is of the LORD\'s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.',
    theme: 'Mercy',
  },
  {
    reference: 'Matthew 5:16',
    text: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.',
    theme: 'Light',
  },
  {
    reference: 'Matthew 7:7',
    text: 'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.',
    theme: 'Prayer',
  },
  {
    reference: 'Matthew 11:28-30',
    text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls. For my yoke is easy, and my burden is light.',
    theme: 'Rest',
  },
  {
    reference: 'Matthew 28:20',
    text: 'Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.',
    theme: 'Presence',
  },
  {
    reference: 'John 8:32',
    text: 'And ye shall know the truth, and the truth shall make you free.',
    theme: 'Truth',
  },
  {
    reference: 'John 10:10',
    text: 'The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly.',
    theme: 'Abundant Life',
  },
  {
    reference: 'John 14:6',
    text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.',
    theme: 'Salvation',
  },
  {
    reference: 'John 14:27',
    text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
    theme: 'Peace',
  },
  {
    reference: 'John 15:5',
    text: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.',
    theme: 'Abiding',
  },
  {
    reference: 'John 16:33',
    text: 'These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.',
    theme: 'Victory',
  },
  {
    reference: 'Romans 5:8',
    text: 'But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.',
    theme: 'Love',
  },
  {
    reference: 'Romans 8:1',
    text: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.',
    theme: 'Freedom',
  },
  {
    reference: 'Romans 8:28',
    text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    theme: 'Purpose',
  },
  {
    reference: 'Romans 8:37',
    text: 'Nay, in all these things we are more than conquerors through him that loved us.',
    theme: 'Victory',
  },
  {
    reference: 'Romans 10:9',
    text: 'That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.',
    theme: 'Salvation',
  },
  {
    reference: '1 Corinthians 10:13',
    text: 'There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it.',
    theme: 'Faithfulness',
  },
  {
    reference: '1 Corinthians 13:4-7',
    text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil; Rejoiceth not in iniquity, but rejoiceth in the truth; Beareth all things, believeth all things, hopeth all things, endureth all things.',
    theme: 'Love',
  },
  {
    reference: '2 Corinthians 12:9',
    text: 'And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.',
    theme: 'Grace',
  },
  {
    reference: 'Galatians 5:22-23',
    text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.',
    theme: 'Fruit of the Spirit',
  },
  {
    reference: 'Ephesians 3:20',
    text: 'Now unto him that is able to do exceeding abundantly above all that we ask or think, according to the power that worketh in us.',
    theme: 'Power',
  },
  {
    reference: 'Ephesians 6:10-11',
    text: 'Finally, my brethren, be strong in the Lord, and in the power of his might. Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.',
    theme: 'Spiritual Warfare',
  },
  {
    reference: 'Philippians 4:6-7',
    text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
    theme: 'Peace',
  },
  {
    reference: 'Philippians 4:19',
    text: 'But my God shall supply all your need according to his riches in glory by Christ Jesus.',
    theme: 'Provision',
  },
  {
    reference: 'Colossians 3:2',
    text: 'Set your affection on things above, not on things on the earth.',
    theme: 'Focus',
  },
  {
    reference: '2 Timothy 1:7',
    text: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.',
    theme: 'Courage',
  },
  {
    reference: 'Hebrews 4:16',
    text: 'Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.',
    theme: 'Grace',
  },
  {
    reference: 'Hebrews 12:1-2',
    text: 'Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us, Looking unto Jesus the author and finisher of our faith.',
    theme: 'Perseverance',
  },
  {
    reference: 'Hebrews 13:5',
    text: 'Let your conversation be without covetousness; and be content with such things as ye have: for he hath said, I will never leave thee, nor forsake thee.',
    theme: 'Contentment',
  },
  {
    reference: 'James 1:2-3',
    text: 'My brethren, count it all joy when ye fall into divers temptations; Knowing this, that the trying of your faith worketh patience.',
    theme: 'Trials',
  },
  {
    reference: 'James 1:5',
    text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.',
    theme: 'Wisdom',
  },
  {
    reference: '1 Peter 5:7',
    text: 'Casting all your care upon him; for he careth for you.',
    theme: 'Trust',
  },
  {
    reference: '1 John 1:9',
    text: 'If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.',
    theme: 'Forgiveness',
  },
  {
    reference: '1 John 4:4',
    text: 'Ye are of God, little children, and have overcome them: because greater is he that is in you, than he that is in the world.',
    theme: 'Victory',
  },
  {
    reference: '1 John 4:19',
    text: 'We love him, because he first loved us.',
    theme: 'Love',
  },
  {
    reference: 'Revelation 3:20',
    text: 'Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me.',
    theme: 'Invitation',
  },
];



// Topics for study
export const topics = [
  { name: 'The Road to Salvation', icon: 'road', count: 42, highlight: 'Salvation' },
  { name: 'Sons of God', icon: 'crown', count: 24 },
  { name: 'Baptism', icon: 'droplet', count: 32 },
  { name: 'New Life', icon: 'sunrise', count: 45 },
  { name: 'The Spirit', icon: 'wind', count: 89 },
  { name: 'Faith', icon: 'heart', count: 156 },
  { name: 'Love', icon: 'heart', count: 234 },
  { name: 'Salvation', icon: 'shield', count: 78 },
  { name: 'Grace', icon: 'gift', count: 112 },
  { name: 'Prayer', icon: 'hands', count: 145 },
  { name: 'Wisdom', icon: 'book', count: 167 },
  { name: 'Peace', icon: 'dove', count: 98 },
  { name: 'Hope', icon: 'anchor', count: 87 },
  { name: 'Righteousness', icon: 'scale', count: 134 },
  { name: 'Redemption', icon: 'cross', count: 56 },
  { name: 'Kingdom', icon: 'crown', count: 178 },
  { name: 'Eternal Life', icon: 'infinity', count: 45 },
  { name: 'Forgiveness', icon: 'heart', count: 89 },
  { name: 'Obedience', icon: 'check', count: 123 },
  { name: 'Worship', icon: 'music', count: 198 },
  { name: 'Covenant', icon: 'scroll', count: 67 },
  { name: 'Prophecy', icon: 'eye', count: 234 },
  { name: 'Resurrection', icon: 'sun', count: 34 },
  { name: 'Transformation', icon: 'refresh', count: 28 },
];


// Reading plans
export const readingPlans = [
  {
    id: 'baptism-new-life',
    title: 'Baptism & New Life',
    description: 'Discover the transforming power of baptism - dying to the old self and rising to walk in newness of life.',
    duration: '7 days',
    image: 'droplet',
    verses: [
      { day: 1, reference: 'Romans 6:3-4', title: 'Buried & Raised with Christ' },
      { day: 2, reference: 'Romans 6:5-11', title: 'Dead to Sin, Alive to God' },
      { day: 3, reference: 'Colossians 2:12-14', title: 'Raised Through Faith' },
      { day: 4, reference: '2 Corinthians 5:17', title: 'A New Creation' },
      { day: 5, reference: 'Galatians 2:20', title: 'Christ Liveth in Me' },
      { day: 6, reference: 'Ephesians 4:22-24', title: 'Put on the New Man' },
      { day: 7, reference: 'Titus 3:4-7', title: 'Washing of Regeneration' },
    ],
  },
  {
    id: 'sonship',
    title: 'Sons of God Study',
    description: 'A 7-day journey exploring what it means to be a child of God through Christ.',
    duration: '7 days',
    image: 'crown',
    verses: [
      { day: 1, reference: 'John 1:12-13', title: 'Power to Become Sons' },
      { day: 2, reference: 'Romans 8:14-17', title: 'Led by the Spirit' },
      { day: 3, reference: 'Galatians 3:26-29', title: 'Children by Faith' },
      { day: 4, reference: 'Galatians 4:4-7', title: 'No More Servants' },
      { day: 5, reference: 'Ephesians 1:3-6', title: 'Adoption of Children' },
      { day: 6, reference: '1 John 3:1-3', title: 'Called Sons of God' },
      { day: 7, reference: 'Hebrews 2:10-13', title: 'Many Sons unto Glory' },
    ],
  },
  {
    id: 'wwjd',
    title: 'WWJD - Walking as Jesus Walked',
    description: 'Learn to follow Christ\'s example in every situation. What Would Jesus Do?',
    duration: '7 days',
    image: 'footprints',
    verses: [
      { day: 1, reference: '1 John 2:6', title: 'Walk as He Walked' },
      { day: 2, reference: 'John 13:15', title: 'Follow His Example' },
      { day: 3, reference: 'Philippians 2:5-8', title: 'The Mind of Christ' },
      { day: 4, reference: '1 Peter 2:21', title: 'Following His Steps' },
      { day: 5, reference: 'Ephesians 5:1-2', title: 'Followers of God' },
      { day: 6, reference: 'Matthew 16:24', title: 'Deny Thyself, Follow Christ' },
      { day: 7, reference: 'Colossians 3:17', title: 'Do All in His Name' },
    ],
  },
  {
    id: 'gospel-john',
    title: 'Gospel of John',
    description: 'Discover the deity of Christ and eternal life through John\'s testimony.',
    duration: '21 days',
    image: 'book',
    verses: [
      { day: 1, reference: 'John 1:1-18', title: 'The Word Was Made Flesh' },
      { day: 2, reference: 'John 3:1-21', title: 'Ye Must Be Born Again' },
      { day: 3, reference: 'John 4:1-26', title: 'Living Water' },
    ],
  },
  {
    id: 'romans',
    title: 'Romans Deep Dive',
    description: 'Paul\'s masterpiece on salvation, grace, and life in the Spirit.',
    duration: '30 days',
    image: 'scroll',
    verses: [
      { day: 1, reference: 'Romans 1:1-17', title: 'The Gospel of God' },
      { day: 2, reference: 'Romans 3:21-31', title: 'Righteousness by Faith' },
      { day: 3, reference: 'Romans 5:1-11', title: 'Peace with God' },
    ],
  },
  {
    id: 'spirit',
    title: 'Life in the Spirit',
    description: 'Understanding the work of the Holy Ghost in the believer\'s life.',
    duration: '14 days',
    image: 'wind',
    verses: [
      { day: 1, reference: 'John 14:15-26', title: 'The Comforter' },
      { day: 2, reference: 'John 16:5-15', title: 'The Spirit of Truth' },
      { day: 3, reference: 'Acts 2:1-21', title: 'The Day of Pentecost' },
    ],
  },
  {
    id: 'firstborn',
    title: 'Christ the Firstborn',
    description: 'Exploring Jesus as the firstborn among many brethren.',
    duration: '10 days',
    image: 'star',
    verses: [
      { day: 1, reference: 'Colossians 1:15-20', title: 'Firstborn of Every Creature' },
      { day: 2, reference: 'Romans 8:29', title: 'Firstborn Among Many Brethren' },
      { day: 3, reference: 'Hebrews 1:1-6', title: 'The Son Appointed Heir' },
    ],
  },
];

// Sample scripture content for display - KJV 1611
export const sampleScriptures: Record<string, { verses: { number: number; text: string }[] }> = {
  'Romans 8': {
    verses: [
      { number: 1, text: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.' },
      { number: 2, text: 'For the law of the Spirit of life in Christ Jesus hath made me free from the law of sin and death.' },
      { number: 3, text: 'For what the law could not do, in that it was weak through the flesh, God sending his own Son in the likeness of sinful flesh, and for sin, condemned sin in the flesh:' },
      { number: 4, text: 'That the righteousness of the law might be fulfilled in us, who walk not after the flesh, but after the Spirit.' },
      { number: 5, text: 'For they that are after the flesh do mind the things of the flesh; but they that are after the Spirit the things of the Spirit.' },
      { number: 6, text: 'For to be carnally minded is death; but to be spiritually minded is life and peace.' },
      { number: 7, text: 'Because the carnal mind is enmity against God: for it is not subject to the law of God, neither indeed can be.' },
      { number: 8, text: 'So then they that are in the flesh cannot please God.' },
      { number: 9, text: 'But ye are not in the flesh, but in the Spirit, if so be that the Spirit of God dwell in you. Now if any man have not the Spirit of Christ, he is none of his.' },
      { number: 10, text: 'And if Christ be in you, the body is dead because of sin; but the Spirit is life because of righteousness.' },
      { number: 11, text: 'But if the Spirit of him that raised up Jesus from the dead dwell in you, he that raised up Christ from the dead shall also quicken your mortal bodies by his Spirit that dwelleth in you.' },
      { number: 12, text: 'Therefore, brethren, we are debtors, not to the flesh, to live after the flesh.' },
      { number: 13, text: 'For if ye live after the flesh, ye shall die: but if ye through the Spirit do mortify the deeds of the body, ye shall live.' },
      { number: 14, text: 'For as many as are led by the Spirit of God, they are the sons of God.' },
      { number: 15, text: 'For ye have not received the spirit of bondage again to fear; but ye have received the Spirit of adoption, whereby we cry, Abba, Father.' },
      { number: 16, text: 'The Spirit itself beareth witness with our spirit, that we are the children of God:' },
      { number: 17, text: 'And if children, then heirs; heirs of God, and joint-heirs with Christ; if so be that we suffer with him, that we may be also glorified together.' },
      { number: 18, text: 'For I reckon that the sufferings of this present time are not worthy to be compared with the glory which shall be revealed in us.' },
      { number: 19, text: 'For the earnest expectation of the creature waiteth for the manifestation of the sons of God.' },
      { number: 20, text: 'For the creature was made subject to vanity, not willingly, but by reason of him who hath subjected the same in hope,' },
      { number: 21, text: 'Because the creature itself also shall be delivered from the bondage of corruption into the glorious liberty of the children of God.' },
      { number: 22, text: 'For we know that the whole creation groaneth and travaileth in pain together until now.' },
      { number: 23, text: 'And not only they, but ourselves also, which have the firstfruits of the Spirit, even we ourselves groan within ourselves, waiting for the adoption, to wit, the redemption of our body.' },
      { number: 24, text: 'For we are saved by hope: but hope that is seen is not hope: for what a man seeth, why doth he yet hope for?' },
      { number: 25, text: 'But if we hope for that we see not, then do we with patience wait for it.' },
      { number: 26, text: 'Likewise the Spirit also helpeth our infirmities: for we know not what we should pray for as we ought: but the Spirit itself maketh intercession for us with groanings which cannot be uttered.' },
      { number: 27, text: 'And he that searcheth the hearts knoweth what is the mind of the Spirit, because he maketh intercession for the saints according to the will of God.' },
      { number: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
      { number: 29, text: 'For whom he did foreknow, he also did predestinate to be conformed to the image of his Son, that he might be the firstborn among many brethren.' },
      { number: 30, text: 'Moreover whom he did predestinate, them he also called: and whom he called, them he also justified: and whom he justified, them he also glorified.' },
      { number: 31, text: 'What shall we then say to these things? If God be for us, who can be against us?' },
      { number: 32, text: 'He that spared not his own Son, but delivered him up for us all, how shall he not with him also freely give us all things?' },
      { number: 33, text: 'Who shall lay any thing to the charge of God\'s elect? It is God that justifieth.' },
      { number: 34, text: 'Who is he that condemneth? It is Christ that died, yea rather, that is risen again, who is even at the right hand of God, who also maketh intercession for us.' },
      { number: 35, text: 'Who shall separate us from the love of Christ? shall tribulation, or distress, or persecution, or famine, or nakedness, or peril, or sword?' },
      { number: 36, text: 'As it is written, For thy sake we are killed all the day long; we are accounted as sheep for the slaughter.' },
      { number: 37, text: 'Nay, in all these things we are more than conquerors through him that loved us.' },
      { number: 38, text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,' },
      { number: 39, text: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.' },
    ],
  },
  'John 1': {
    verses: [
      { number: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { number: 2, text: 'The same was in the beginning with God.' },
      { number: 3, text: 'All things were made by him; and without him was not any thing made that was made.' },
      { number: 4, text: 'In him was life; and the life was the light of men.' },
      { number: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.' },
      { number: 6, text: 'There was a man sent from God, whose name was John.' },
      { number: 7, text: 'The same came for a witness, to bear witness of the Light, that all men through him might believe.' },
      { number: 8, text: 'He was not that Light, but was sent to bear witness of that Light.' },
      { number: 9, text: 'That was the true Light, which lighteth every man that cometh into the world.' },
      { number: 10, text: 'He was in the world, and the world was made by him, and the world knew him not.' },
      { number: 11, text: 'He came unto his own, and his own received him not.' },
      { number: 12, text: 'But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:' },
      { number: 13, text: 'Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.' },
      { number: 14, text: 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.' },
      { number: 15, text: 'John bare witness of him, and cried, saying, This was he of whom I spake, He that cometh after me is preferred before me: for he was before me.' },
      { number: 16, text: 'And of his fulness have all we received, and grace for grace.' },
      { number: 17, text: 'For the law was given by Moses, but grace and truth came by Jesus Christ.' },
      { number: 18, text: 'No man hath seen God at any time; the only begotten Son, which is in the bosom of the Father, he hath declared him.' },
    ],
  },
  'Galatians 3': {
    verses: [
      { number: 1, text: 'O foolish Galatians, who hath bewitched you, that ye should not obey the truth, before whose eyes Jesus Christ hath been evidently set forth, crucified among you?' },
      { number: 2, text: 'This only would I learn of you, Received ye the Spirit by the works of the law, or by the hearing of faith?' },
      { number: 3, text: 'Are ye so foolish? having begun in the Spirit, are ye now made perfect by the flesh?' },
      { number: 26, text: 'For ye are all the children of God by faith in Christ Jesus.' },
      { number: 27, text: 'For as many of you as have been baptized into Christ have put on Christ.' },
      { number: 28, text: 'There is neither Jew nor Greek, there is neither bond nor free, there is neither male nor female: for ye are all one in Christ Jesus.' },
      { number: 29, text: 'And if ye be Christ\'s, then are ye Abraham\'s seed, and heirs according to the promise.' },
    ],
  },
  'Genesis 1': {
    verses: [
      { number: 1, text: 'In the beginning God created the heaven and the earth.' },
      { number: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
      { number: 3, text: 'And God said, Let there be light: and there was light.' },
      { number: 4, text: 'And God saw the light, that it was good: and God divided the light from the darkness.' },
      { number: 5, text: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.' },
      { number: 6, text: 'And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.' },
      { number: 7, text: 'And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.' },
      { number: 8, text: 'And God called the firmament Heaven. And the evening and the morning were the second day.' },
      { number: 9, text: 'And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.' },
      { number: 10, text: 'And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.' },
    ],
  },
  'Psalm 23': {
    verses: [
      { number: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { number: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
      { number: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.' },
      { number: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
      { number: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
      { number: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
    ],
  },
  'Matthew 5': {
    verses: [
      { number: 1, text: 'And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him:' },
      { number: 2, text: 'And he opened his mouth, and taught them, saying,' },
      { number: 3, text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.' },
      { number: 4, text: 'Blessed are they that mourn: for they shall be comforted.' },
      { number: 5, text: 'Blessed are the meek: for they shall inherit the earth.' },
      { number: 6, text: 'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.' },
      { number: 7, text: 'Blessed are the merciful: for they shall obtain mercy.' },
      { number: 8, text: 'Blessed are the pure in heart: for they shall see God.' },
      { number: 9, text: 'Blessed are the peacemakers: for they shall be called the children of God.' },
      { number: 10, text: 'Blessed are they which are persecuted for righteousness\' sake: for theirs is the kingdom of heaven.' },
      { number: 11, text: 'Blessed are ye, when men shall revile you, and persecute you, and shall say all manner of evil against you falsely, for my sake.' },
      { number: 12, text: 'Rejoice, and be exceeding glad: for great is your reward in heaven: for so persecuted they the prophets which were before you.' },
    ],
  },
  'Revelation 21': {
    verses: [
      { number: 1, text: 'And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more sea.' },
      { number: 2, text: 'And I John saw the holy city, new Jerusalem, coming down from God out of heaven, prepared as a bride adorned for her husband.' },
      { number: 3, text: 'And I heard a great voice out of heaven saying, Behold, the tabernacle of God is with men, and he will dwell with them, and they shall be his people, and God himself shall be with them, and be their God.' },
      { number: 4, text: 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.' },
      { number: 5, text: 'And he that sat upon the throne said, Behold, I make all things new. And he said unto me, Write: for these words are true and faithful.' },
      { number: 6, text: 'And he said unto me, It is done. I am Alpha and Omega, the beginning and the end. I will give unto him that is athirst of the fountain of the water of life freely.' },
      { number: 7, text: 'He that overcometh shall inherit all things; and I will be his God, and he shall be my son.' },
    ],
  },
};

// KJV API endpoint for fetching verses
export const kjvApiEndpoint = 'https://bible-api.com';
export const kjvTranslation = 'kjv';

// Helper function to fetch KJV verse from API
export async function fetchKJVVerse(reference: string): Promise<{ reference: string; text: string; verses: { verse: number; text: string }[] } | null> {
  try {
    const response = await fetch(`${kjvApiEndpoint}/${encodeURIComponent(reference)}?translation=${kjvTranslation}`);
    if (!response.ok) throw new Error('Failed to fetch verse');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching KJV verse:', error);
    return null;
  }
}

// Helper function to get verse text from local data or API
export function getLocalVerse(book: string, chapter: number): { verses: { number: number; text: string }[] } | undefined {
  const key = `${book} ${chapter}`;
  return sampleScriptures[key];
}
