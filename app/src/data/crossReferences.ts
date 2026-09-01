// Cross-reference data for Bible verses
// Includes related verses, parallel passages, and thematic connections

export interface CrossReference {
  reference: string;
  text: string;
  type: 'direct' | 'parallel' | 'thematic' | 'prophetic' | 'quotation';
  relationship: string;
}

export interface VerseConnection {
  sourceBook: string;
  sourceChapter: number;
  sourceVerse: number;
  targetBook: string;
  targetChapter: number;
  targetVerse: number;
  type: 'direct' | 'parallel' | 'thematic' | 'prophetic' | 'quotation';
  strength: number; // 1-10, how strong the connection is
}

// Cross-references organized by verse reference
export const crossReferences: Record<string, CrossReference[]> = {
  // Romans 8 cross-references
  'Romans 8:1': [
    { reference: 'John 3:18', text: 'He that believeth on him is not condemned...', type: 'thematic', relationship: 'No condemnation for believers' },
    { reference: 'John 5:24', text: 'He that heareth my word, and believeth on him that sent me, hath everlasting life, and shall not come into condemnation...', type: 'parallel', relationship: 'Freedom from condemnation' },
    { reference: 'Romans 5:1', text: 'Therefore being justified by faith, we have peace with God through our Lord Jesus Christ.', type: 'thematic', relationship: 'Justification brings peace' },
    { reference: 'Galatians 3:13', text: 'Christ hath redeemed us from the curse of the law...', type: 'thematic', relationship: 'Redemption from curse' },
  ],
  'Romans 8:2': [
    { reference: 'John 8:32', text: 'And ye shall know the truth, and the truth shall make you free.', type: 'thematic', relationship: 'Freedom through truth' },
    { reference: 'John 8:36', text: 'If the Son therefore shall make you free, ye shall be free indeed.', type: 'parallel', relationship: 'True freedom in Christ' },
    { reference: 'Galatians 5:1', text: 'Stand fast therefore in the liberty wherewith Christ hath made us free...', type: 'thematic', relationship: 'Liberty in Christ' },
    { reference: '2 Corinthians 3:17', text: 'Now the Lord is that Spirit: and where the Spirit of the Lord is, there is liberty.', type: 'direct', relationship: 'Spirit brings liberty' },
  ],
  'Romans 8:14': [
    { reference: 'Galatians 4:6', text: 'And because ye are sons, God hath sent forth the Spirit of his Son into your hearts, crying, Abba, Father.', type: 'parallel', relationship: 'Spirit confirms sonship' },
    { reference: 'Galatians 3:26', text: 'For ye are all the children of God by faith in Christ Jesus.', type: 'thematic', relationship: 'Children by faith' },
    { reference: '1 John 3:1', text: 'Behold, what manner of love the Father hath bestowed upon us, that we should be called the sons of God...', type: 'thematic', relationship: 'Called sons of God' },
    { reference: 'John 1:12', text: 'But as many as received him, to them gave he power to become the sons of God...', type: 'direct', relationship: 'Power to become sons' },
  ],
  'Romans 8:16': [
    { reference: '2 Corinthians 1:22', text: 'Who hath also sealed us, and given the earnest of the Spirit in our hearts.', type: 'thematic', relationship: 'Spirit as seal' },
    { reference: 'Ephesians 1:13-14', text: 'In whom ye also trusted, after that ye heard the word of truth...ye were sealed with that holy Spirit of promise.', type: 'parallel', relationship: 'Sealed by Spirit' },
    { reference: 'Galatians 4:6', text: 'And because ye are sons, God hath sent forth the Spirit of his Son into your hearts, crying, Abba, Father.', type: 'direct', relationship: 'Spirit witnesses sonship' },
    { reference: '1 John 5:10', text: 'He that believeth on the Son of God hath the witness in himself...', type: 'thematic', relationship: 'Internal witness' },
  ],
  'Romans 8:17': [
    { reference: 'Galatians 3:29', text: 'And if ye be Christ\'s, then are ye Abraham\'s seed, and heirs according to the promise.', type: 'parallel', relationship: 'Heirs of promise' },
    { reference: 'Galatians 4:7', text: 'Wherefore thou art no more a servant, but a son; and if a son, then an heir of God through Christ.', type: 'direct', relationship: 'Sons are heirs' },
    { reference: 'Titus 3:7', text: 'That being justified by his grace, we should be made heirs according to the hope of eternal life.', type: 'thematic', relationship: 'Heirs of eternal life' },
    { reference: '1 Peter 1:4', text: 'To an inheritance incorruptible, and undefiled, and that fadeth not away, reserved in heaven for you.', type: 'thematic', relationship: 'Eternal inheritance' },
  ],
  'Romans 8:28': [
    { reference: 'Genesis 50:20', text: 'But as for you, ye thought evil against me; but God meant it unto good...', type: 'thematic', relationship: 'God works all for good' },
    { reference: 'Jeremiah 29:11', text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil...', type: 'thematic', relationship: 'God\'s good plans' },
    { reference: 'Ephesians 1:11', text: 'In whom also we have obtained an inheritance, being predestinated according to the purpose of him who worketh all things after the counsel of his own will.', type: 'parallel', relationship: 'God\'s sovereign purpose' },
    { reference: '2 Corinthians 4:17', text: 'For our light affliction, which is but for a moment, worketh for us a far more exceeding and eternal weight of glory.', type: 'thematic', relationship: 'Affliction works glory' },
  ],
  'Romans 8:29': [
    { reference: 'Colossians 1:15', text: 'Who is the image of the invisible God, the firstborn of every creature.', type: 'direct', relationship: 'Christ the firstborn' },
    { reference: 'Hebrews 1:6', text: 'And again, when he bringeth in the firstbegotten into the world, he saith, And let all the angels of God worship him.', type: 'parallel', relationship: 'Firstborn worship' },
    { reference: '2 Corinthians 3:18', text: 'But we all, with open face beholding as in a glass the glory of the Lord, are changed into the same image from glory to glory...', type: 'thematic', relationship: 'Conformed to image' },
    { reference: '1 John 3:2', text: 'Beloved, now are we the sons of God, and it doth not yet appear what we shall be: but we know that, when he shall appear, we shall be like him...', type: 'thematic', relationship: 'We shall be like Him' },
  ],
  'Romans 8:31': [
    { reference: 'Psalm 118:6', text: 'The LORD is on my side; I will not fear: what can man do unto me?', type: 'quotation', relationship: 'God is for us' },
    { reference: 'Numbers 14:9', text: '...the LORD is with us: fear them not.', type: 'thematic', relationship: 'God with us' },
    { reference: 'Isaiah 41:10', text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God...', type: 'thematic', relationship: 'God\'s presence removes fear' },
    { reference: 'Hebrews 13:6', text: 'So that we may boldly say, The Lord is my helper, and I will not fear what man shall do unto me.', type: 'parallel', relationship: 'Boldness in God' },
  ],
  'Romans 8:37': [
    { reference: '1 Corinthians 15:57', text: 'But thanks be to God, which giveth us the victory through our Lord Jesus Christ.', type: 'parallel', relationship: 'Victory through Christ' },
    { reference: '2 Corinthians 2:14', text: 'Now thanks be unto God, which always causeth us to triumph in Christ...', type: 'thematic', relationship: 'Triumph in Christ' },
    { reference: '1 John 5:4', text: 'For whatsoever is born of God overcometh the world: and this is the victory that overcometh the world, even our faith.', type: 'thematic', relationship: 'Overcoming faith' },
    { reference: 'Revelation 12:11', text: 'And they overcame him by the blood of the Lamb, and by the word of their testimony...', type: 'thematic', relationship: 'Overcoming by blood' },
  ],

  // John 1 cross-references
  'John 1:1': [
    { reference: 'Genesis 1:1', text: 'In the beginning God created the heaven and the earth.', type: 'parallel', relationship: 'In the beginning' },
    { reference: '1 John 1:1', text: 'That which was from the beginning, which we have heard, which we have seen with our eyes...', type: 'direct', relationship: 'From the beginning' },
    { reference: 'Colossians 1:17', text: 'And he is before all things, and by him all things consist.', type: 'thematic', relationship: 'Pre-existence of Christ' },
    { reference: 'Hebrews 1:2', text: 'Hath in these last days spoken unto us by his Son, whom he hath appointed heir of all things, by whom also he made the worlds.', type: 'thematic', relationship: 'Christ as Creator' },
  ],
  'John 1:3': [
    { reference: 'Colossians 1:16', text: 'For by him were all things created, that are in heaven, and that are in earth, visible and invisible...', type: 'direct', relationship: 'All things created by Him' },
    { reference: 'Hebrews 1:2', text: '...by whom also he made the worlds.', type: 'parallel', relationship: 'Made the worlds' },
    { reference: '1 Corinthians 8:6', text: '...and one Lord Jesus Christ, by whom are all things, and we by him.', type: 'thematic', relationship: 'All things by Christ' },
    { reference: 'Ephesians 3:9', text: '...God, who created all things by Jesus Christ.', type: 'direct', relationship: 'Creation through Christ' },
  ],
  'John 1:12': [
    { reference: 'Romans 8:14-15', text: 'For as many as are led by the Spirit of God, they are the sons of God...ye have received the Spirit of adoption...', type: 'parallel', relationship: 'Sons by Spirit' },
    { reference: 'Galatians 3:26', text: 'For ye are all the children of God by faith in Christ Jesus.', type: 'direct', relationship: 'Children by faith' },
    { reference: '1 John 3:1', text: 'Behold, what manner of love the Father hath bestowed upon us, that we should be called the sons of God...', type: 'thematic', relationship: 'Called sons' },
    { reference: '2 Corinthians 6:18', text: 'And will be a Father unto you, and ye shall be my sons and daughters, saith the Lord Almighty.', type: 'thematic', relationship: 'God as Father' },
  ],
  'John 1:14': [
    { reference: 'Philippians 2:7', text: 'But made himself of no reputation, and took upon him the form of a servant, and was made in the likeness of men.', type: 'parallel', relationship: 'Word made flesh' },
    { reference: '1 Timothy 3:16', text: 'And without controversy great is the mystery of godliness: God was manifest in the flesh...', type: 'direct', relationship: 'God manifest in flesh' },
    { reference: 'Hebrews 2:14', text: 'Forasmuch then as the children are partakers of flesh and blood, he also himself likewise took part of the same...', type: 'thematic', relationship: 'Took on flesh' },
    { reference: 'Colossians 2:9', text: 'For in him dwelleth all the fulness of the Godhead bodily.', type: 'thematic', relationship: 'Fullness in bodily form' },
  ],

  // Psalm 23 cross-references
  'Psalm 23:1': [
    { reference: 'John 10:11', text: 'I am the good shepherd: the good shepherd giveth his life for the sheep.', type: 'prophetic', relationship: 'Christ the Good Shepherd' },
    { reference: 'Isaiah 40:11', text: 'He shall feed his flock like a shepherd: he shall gather the lambs with his arm...', type: 'parallel', relationship: 'God feeds His flock' },
    { reference: 'Ezekiel 34:23', text: 'And I will set up one shepherd over them, and he shall feed them, even my servant David...', type: 'prophetic', relationship: 'One Shepherd' },
    { reference: 'Hebrews 13:20', text: '...that great shepherd of the sheep, through the blood of the everlasting covenant.', type: 'thematic', relationship: 'Great Shepherd' },
  ],
  'Psalm 23:4': [
    { reference: 'Isaiah 43:2', text: 'When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee...', type: 'thematic', relationship: 'God\'s presence in trials' },
    { reference: 'Psalm 46:1', text: 'God is our refuge and strength, a very present help in trouble.', type: 'parallel', relationship: 'God present in trouble' },
    { reference: 'Hebrews 13:5', text: '...for he hath said, I will never leave thee, nor forsake thee.', type: 'thematic', relationship: 'Never forsaken' },
    { reference: 'Matthew 28:20', text: '...lo, I am with you alway, even unto the end of the world.', type: 'thematic', relationship: 'Always with us' },
  ],

  // Genesis 1 cross-references
  'Genesis 1:1': [
    { reference: 'John 1:1-3', text: 'In the beginning was the Word, and the Word was with God, and the Word was God...All things were made by him.', type: 'parallel', relationship: 'Creation through the Word' },
    { reference: 'Hebrews 11:3', text: 'Through faith we understand that the worlds were framed by the word of God...', type: 'thematic', relationship: 'Worlds framed by God' },
    { reference: 'Psalm 33:6', text: 'By the word of the LORD were the heavens made; and all the host of them by the breath of his mouth.', type: 'parallel', relationship: 'Creation by Word' },
    { reference: 'Colossians 1:16', text: 'For by him were all things created, that are in heaven, and that are in earth...', type: 'thematic', relationship: 'All things created' },
  ],
  'Genesis 1:3': [
    { reference: '2 Corinthians 4:6', text: 'For God, who commanded the light to shine out of darkness, hath shined in our hearts...', type: 'thematic', relationship: 'Light from darkness' },
    { reference: 'John 1:4-5', text: 'In him was life; and the life was the light of men. And the light shineth in darkness...', type: 'parallel', relationship: 'Christ as Light' },
    { reference: 'Psalm 33:9', text: 'For he spake, and it was done; he commanded, and it stood fast.', type: 'thematic', relationship: 'God speaks, it happens' },
    { reference: '1 John 1:5', text: 'God is light, and in him is no darkness at all.', type: 'thematic', relationship: 'God is light' },
  ],

  // Matthew 5 cross-references (Beatitudes)
  'Matthew 5:3': [
    { reference: 'Isaiah 57:15', text: '...I dwell in the high and holy place, with him also that is of a contrite and humble spirit...', type: 'thematic', relationship: 'God with humble' },
    { reference: 'Isaiah 66:2', text: '...but to this man will I look, even to him that is poor and of a contrite spirit, and trembleth at my word.', type: 'parallel', relationship: 'God looks to humble' },
    { reference: 'Luke 6:20', text: 'Blessed be ye poor: for yours is the kingdom of God.', type: 'direct', relationship: 'Parallel beatitude' },
    { reference: 'James 2:5', text: 'Hath not God chosen the poor of this world rich in faith, and heirs of the kingdom...', type: 'thematic', relationship: 'Poor inherit kingdom' },
  ],
  'Matthew 5:8': [
    { reference: 'Psalm 24:3-4', text: 'Who shall ascend into the hill of the LORD?...He that hath clean hands, and a pure heart...', type: 'parallel', relationship: 'Pure heart sees God' },
    { reference: 'Hebrews 12:14', text: 'Follow peace with all men, and holiness, without which no man shall see the Lord.', type: 'thematic', relationship: 'Holiness to see God' },
    { reference: '1 John 3:2-3', text: '...we shall see him as he is. And every man that hath this hope in him purifieth himself...', type: 'thematic', relationship: 'Purity to see Him' },
    { reference: 'Revelation 22:4', text: 'And they shall see his face; and his name shall be in their foreheads.', type: 'prophetic', relationship: 'See His face' },
  ],
  'Matthew 5:9': [
    { reference: 'Romans 8:14', text: 'For as many as are led by the Spirit of God, they are the sons of God.', type: 'thematic', relationship: 'Sons of God' },
    { reference: 'James 3:18', text: 'And the fruit of righteousness is sown in peace of them that make peace.', type: 'parallel', relationship: 'Fruit of peacemakers' },
    { reference: 'Hebrews 12:14', text: 'Follow peace with all men, and holiness...', type: 'thematic', relationship: 'Pursue peace' },
    { reference: 'Colossians 1:20', text: '...having made peace through the blood of his cross...', type: 'thematic', relationship: 'Christ made peace' },
  ],

  // Galatians 3 cross-references
  'Galatians 3:26': [
    { reference: 'John 1:12', text: 'But as many as received him, to them gave he power to become the sons of God...', type: 'direct', relationship: 'Sons by faith' },
    { reference: 'Romans 8:14', text: 'For as many as are led by the Spirit of God, they are the sons of God.', type: 'parallel', relationship: 'Sons by Spirit' },
    { reference: '1 John 3:1', text: 'Behold, what manner of love the Father hath bestowed upon us, that we should be called the sons of God...', type: 'thematic', relationship: 'Called sons' },
    { reference: '1 John 5:1', text: 'Whosoever believeth that Jesus is the Christ is born of God...', type: 'thematic', relationship: 'Born of God by faith' },
  ],
  'Galatians 3:27': [
    { reference: 'Romans 6:3-4', text: 'Know ye not, that so many of us as were baptized into Jesus Christ were baptized into his death?...', type: 'direct', relationship: 'Baptized into Christ' },
    { reference: 'Colossians 2:12', text: 'Buried with him in baptism, wherein also ye are risen with him through the faith...', type: 'parallel', relationship: 'Buried and risen in baptism' },
    { reference: 'Romans 13:14', text: 'But put ye on the Lord Jesus Christ, and make not provision for the flesh...', type: 'thematic', relationship: 'Put on Christ' },
    { reference: 'Ephesians 4:24', text: 'And that ye put on the new man, which after God is created in righteousness and true holiness.', type: 'thematic', relationship: 'Put on new man' },
  ],

  // Revelation 21 cross-references
  'Revelation 21:1': [
    { reference: 'Isaiah 65:17', text: 'For, behold, I create new heavens and a new earth: and the former shall not be remembered, nor come into mind.', type: 'prophetic', relationship: 'New heavens and earth' },
    { reference: 'Isaiah 66:22', text: 'For as the new heavens and the new earth, which I will make, shall remain before me...', type: 'parallel', relationship: 'New creation remains' },
    { reference: '2 Peter 3:13', text: 'Nevertheless we, according to his promise, look for new heavens and a new earth, wherein dwelleth righteousness.', type: 'direct', relationship: 'Promise of new creation' },
    { reference: 'Romans 8:21', text: 'Because the creature itself also shall be delivered from the bondage of corruption into the glorious liberty of the children of God.', type: 'thematic', relationship: 'Creation delivered' },
  ],
  'Revelation 21:4': [
    { reference: 'Isaiah 25:8', text: 'He will swallow up death in victory; and the Lord God will wipe away tears from off all faces...', type: 'prophetic', relationship: 'No more tears' },

    { reference: 'Isaiah 35:10', text: '...and sorrow and sighing shall flee away.', type: 'parallel', relationship: 'Sorrow flees' },
    { reference: '1 Corinthians 15:54', text: '...then shall be brought to pass the saying that is written, Death is swallowed up in victory.', type: 'direct', relationship: 'Death defeated' },
    { reference: 'Revelation 7:17', text: '...and God shall wipe away all tears from their eyes.', type: 'parallel', relationship: 'Tears wiped away' },
  ],
  'Revelation 21:7': [
    { reference: 'Romans 8:17', text: 'And if children, then heirs; heirs of God, and joint-heirs with Christ...', type: 'thematic', relationship: 'Heirs inherit all' },
    { reference: '1 John 5:4-5', text: 'For whatsoever is born of God overcometh the world...', type: 'parallel', relationship: 'Overcomers' },
    { reference: '2 Samuel 7:14', text: 'I will be his father, and he shall be my son...', type: 'prophetic', relationship: 'Father-son relationship' },
    { reference: 'Hebrews 1:14', text: 'Are they not all ministering spirits, sent forth to minister for them who shall be heirs of salvation?', type: 'thematic', relationship: 'Heirs of salvation' },
  ],
};

// Thematic groups for exploring related scriptures
export const thematicGroups: Record<string, { title: string; description: string; verses: string[] }> = {
  'sonship': {
    title: 'Sons of God',
    description: 'Scriptures about our identity as children of God',
    verses: [
      'John 1:12', 'Romans 8:14', 'Romans 8:16-17', 'Galatians 3:26', 
      'Galatians 4:6-7', '1 John 3:1-2', 'Ephesians 1:5', '2 Corinthians 6:18',
      'Hebrews 2:10', 'Philippians 2:15'
    ]
  },
  'salvation': {
    title: 'Salvation',
    description: 'The gift of salvation through faith in Christ',
    verses: [
      'John 3:16', 'Romans 10:9', 'Ephesians 2:8-9', 'Acts 4:12',
      'John 14:6', 'Romans 5:8', 'Titus 3:5', '1 John 5:11-12',
      'Acts 16:31', '2 Corinthians 5:17'
    ]
  },
  'holy-spirit': {
    title: 'The Holy Spirit',
    description: 'The work and presence of the Spirit',
    verses: [
      'John 14:16-17', 'John 16:13', 'Romans 8:9', 'Romans 8:26',
      'Galatians 5:22-23', '1 Corinthians 6:19', 'Acts 1:8', 'Ephesians 1:13-14',
      '2 Corinthians 3:17', 'John 3:5-6'
    ]
  },
  'faith': {
    title: 'Faith',
    description: 'Living by faith in God',
    verses: [
      'Hebrews 11:1', 'Hebrews 11:6', 'Romans 10:17', 'Galatians 2:20',
      'Ephesians 2:8', '2 Corinthians 5:7', 'James 2:17', 'Mark 11:22-24',
      'Romans 1:17', '1 John 5:4'
    ]
  },
  'love': {
    title: 'God\'s Love',
    description: 'The unfailing love of God',
    verses: [
      'John 3:16', 'Romans 5:8', '1 John 4:8', '1 John 4:19',
      'Romans 8:35-39', '1 Corinthians 13:4-7', 'Ephesians 3:17-19', 'Jeremiah 31:3',
      'John 15:9', 'Zephaniah 3:17'
    ]
  },
  'baptism': {
    title: 'Baptism & New Life',
    description: 'Death to self and resurrection life',
    verses: [
      'Romans 6:3-4', 'Romans 6:6', 'Colossians 2:12', 'Galatians 3:27',
      '2 Corinthians 5:17', 'Galatians 2:20', 'Ephesians 4:22-24', 'Titus 3:5',
      '1 Peter 3:21', 'Acts 2:38'
    ]
  },
  'promises': {
    title: 'God\'s Promises',
    description: 'Faithful promises of God',
    verses: [
      'Jeremiah 29:11', 'Romans 8:28', 'Philippians 4:19', '2 Corinthians 1:20',
      'Isaiah 41:10', 'Joshua 1:9', 'Psalm 23:1', 'Matthew 28:20',
      'Hebrews 13:5', '2 Peter 1:4'
    ]
  },
  'peace': {
    title: 'Peace',
    description: 'The peace of God',
    verses: [
      'John 14:27', 'Philippians 4:6-7', 'Isaiah 26:3', 'Romans 5:1',
      'Colossians 3:15', 'John 16:33', 'Psalm 29:11', 'Isaiah 9:6',
      'Romans 8:6', '2 Thessalonians 3:16'
    ]
  },
  'victory': {
    title: 'Victory in Christ',
    description: 'Overcoming through Christ',
    verses: [
      'Romans 8:37', '1 Corinthians 15:57', '1 John 5:4', '2 Corinthians 2:14',
      'Revelation 12:11', 'John 16:33', '1 John 4:4', 'Romans 8:31',
      'Colossians 2:15', 'James 4:7'
    ]
  },
  'creation': {
    title: 'Creation',
    description: 'God as Creator',
    verses: [
      'Genesis 1:1', 'John 1:1-3', 'Colossians 1:16', 'Hebrews 11:3',
      'Psalm 33:6', 'Isaiah 40:28', 'Revelation 4:11', 'Nehemiah 9:6',
      'Psalm 19:1', 'Romans 1:20'
    ]
  }
};

// Visual connection data for the verse map
export const verseConnections: VerseConnection[] = [
  // Romans 8 connections
  { sourceBook: 'Romans', sourceChapter: 8, sourceVerse: 14, targetBook: 'Galatians', targetChapter: 3, targetVerse: 26, type: 'parallel', strength: 9 },
  { sourceBook: 'Romans', sourceChapter: 8, sourceVerse: 14, targetBook: 'John', targetChapter: 1, targetVerse: 12, type: 'direct', strength: 10 },
  { sourceBook: 'Romans', sourceChapter: 8, sourceVerse: 14, targetBook: '1 John', targetChapter: 3, targetVerse: 1, type: 'thematic', strength: 8 },
  { sourceBook: 'Romans', sourceChapter: 8, sourceVerse: 29, targetBook: 'Colossians', targetChapter: 1, targetVerse: 15, type: 'direct', strength: 10 },
  { sourceBook: 'Romans', sourceChapter: 8, sourceVerse: 29, targetBook: 'Hebrews', targetChapter: 1, targetVerse: 6, type: 'parallel', strength: 8 },
  { sourceBook: 'Romans', sourceChapter: 8, sourceVerse: 1, targetBook: 'John', targetChapter: 3, targetVerse: 18, type: 'thematic', strength: 7 },
  { sourceBook: 'Romans', sourceChapter: 8, sourceVerse: 28, targetBook: 'Jeremiah', targetChapter: 29, targetVerse: 11, type: 'thematic', strength: 8 },
  { sourceBook: 'Romans', sourceChapter: 8, sourceVerse: 37, targetBook: '1 John', targetChapter: 5, targetVerse: 4, type: 'thematic', strength: 9 },
  
  // John 1 connections
  { sourceBook: 'John', sourceChapter: 1, sourceVerse: 1, targetBook: 'Genesis', targetChapter: 1, targetVerse: 1, type: 'parallel', strength: 10 },
  { sourceBook: 'John', sourceChapter: 1, sourceVerse: 1, targetBook: 'Colossians', targetChapter: 1, targetVerse: 17, type: 'thematic', strength: 8 },
  { sourceBook: 'John', sourceChapter: 1, sourceVerse: 3, targetBook: 'Colossians', targetChapter: 1, targetVerse: 16, type: 'direct', strength: 10 },
  { sourceBook: 'John', sourceChapter: 1, sourceVerse: 12, targetBook: 'Romans', targetChapter: 8, targetVerse: 14, type: 'parallel', strength: 9 },
  { sourceBook: 'John', sourceChapter: 1, sourceVerse: 14, targetBook: 'Philippians', targetChapter: 2, targetVerse: 7, type: 'parallel', strength: 9 },
  
  // Genesis 1 connections
  { sourceBook: 'Genesis', sourceChapter: 1, sourceVerse: 1, targetBook: 'John', targetChapter: 1, targetVerse: 1, type: 'parallel', strength: 10 },
  { sourceBook: 'Genesis', sourceChapter: 1, sourceVerse: 3, targetBook: '2 Corinthians', targetChapter: 4, targetVerse: 6, type: 'thematic', strength: 8 },
  
  // Psalm 23 connections
  { sourceBook: 'Psalm', sourceChapter: 23, sourceVerse: 1, targetBook: 'John', targetChapter: 10, targetVerse: 11, type: 'prophetic', strength: 10 },
  { sourceBook: 'Psalm', sourceChapter: 23, sourceVerse: 4, targetBook: 'Isaiah', targetChapter: 43, targetVerse: 2, type: 'thematic', strength: 8 },
  
  // Galatians 3 connections
  { sourceBook: 'Galatians', sourceChapter: 3, sourceVerse: 26, targetBook: 'John', targetChapter: 1, targetVerse: 12, type: 'direct', strength: 9 },
  { sourceBook: 'Galatians', sourceChapter: 3, sourceVerse: 27, targetBook: 'Romans', targetChapter: 6, targetVerse: 3, type: 'direct', strength: 10 },
  
  // Revelation 21 connections
  { sourceBook: 'Revelation', sourceChapter: 21, sourceVerse: 1, targetBook: 'Isaiah', targetChapter: 65, targetVerse: 17, type: 'prophetic', strength: 10 },
  { sourceBook: 'Revelation', sourceChapter: 21, sourceVerse: 4, targetBook: 'Isaiah', targetChapter: 25, targetVerse: 8, type: 'prophetic', strength: 10 },
  { sourceBook: 'Revelation', sourceChapter: 21, sourceVerse: 7, targetBook: 'Romans', targetChapter: 8, targetVerse: 17, type: 'thematic', strength: 8 },
  
  // Matthew 5 connections
  { sourceBook: 'Matthew', sourceChapter: 5, sourceVerse: 3, targetBook: 'Isaiah', targetChapter: 57, targetVerse: 15, type: 'thematic', strength: 7 },
  { sourceBook: 'Matthew', sourceChapter: 5, sourceVerse: 8, targetBook: 'Psalm', targetChapter: 24, targetVerse: 4, type: 'parallel', strength: 9 },
  { sourceBook: 'Matthew', sourceChapter: 5, sourceVerse: 9, targetBook: 'Romans', targetChapter: 8, targetVerse: 14, type: 'thematic', strength: 7 },
];

// Helper function to get cross-references for a verse
export function getCrossReferences(reference: string): CrossReference[] {
  return crossReferences[reference] || [];
}

// Helper function to get thematic group by key
export function getThematicGroup(key: string) {
  return thematicGroups[key];
}

// Helper function to find all connections for a verse
export function getVerseConnections(book: string, chapter: number, verse: number): VerseConnection[] {
  return verseConnections.filter(
    conn => 
      (conn.sourceBook === book && conn.sourceChapter === chapter && conn.sourceVerse === verse) ||
      (conn.targetBook === book && conn.targetChapter === chapter && conn.targetVerse === verse)
  );
}

// Get all books that have connections to a specific book
export function getConnectedBooks(book: string): string[] {
  const connected = new Set<string>();
  verseConnections.forEach(conn => {
    if (conn.sourceBook === book) {
      connected.add(conn.targetBook);
    } else if (conn.targetBook === book) {
      connected.add(conn.sourceBook);
    }
  });
  return Array.from(connected);
}

// Bible book positions for visual map (simplified)
export const bookPositions: Record<string, { x: number; y: number; testament: 'old' | 'new' }> = {
  'Genesis': { x: 50, y: 50, testament: 'old' },
  'Exodus': { x: 100, y: 50, testament: 'old' },
  'Leviticus': { x: 150, y: 50, testament: 'old' },
  'Numbers': { x: 200, y: 50, testament: 'old' },
  'Deuteronomy': { x: 250, y: 50, testament: 'old' },
  'Joshua': { x: 50, y: 100, testament: 'old' },
  'Judges': { x: 100, y: 100, testament: 'old' },
  'Ruth': { x: 150, y: 100, testament: 'old' },
  '1 Samuel': { x: 200, y: 100, testament: 'old' },
  '2 Samuel': { x: 250, y: 100, testament: 'old' },
  '1 Kings': { x: 50, y: 150, testament: 'old' },
  '2 Kings': { x: 100, y: 150, testament: 'old' },
  'Psalm': { x: 200, y: 200, testament: 'old' },
  'Proverbs': { x: 250, y: 200, testament: 'old' },
  'Isaiah': { x: 50, y: 250, testament: 'old' },
  'Jeremiah': { x: 100, y: 250, testament: 'old' },
  'Ezekiel': { x: 150, y: 250, testament: 'old' },
  'Daniel': { x: 200, y: 250, testament: 'old' },
  // New Testament
  'Matthew': { x: 400, y: 50, testament: 'new' },
  'Mark': { x: 450, y: 50, testament: 'new' },
  'Luke': { x: 500, y: 50, testament: 'new' },
  'John': { x: 550, y: 50, testament: 'new' },
  'Acts': { x: 400, y: 100, testament: 'new' },
  'Romans': { x: 450, y: 100, testament: 'new' },
  '1 Corinthians': { x: 500, y: 100, testament: 'new' },
  '2 Corinthians': { x: 550, y: 100, testament: 'new' },
  'Galatians': { x: 400, y: 150, testament: 'new' },
  'Ephesians': { x: 450, y: 150, testament: 'new' },
  'Philippians': { x: 500, y: 150, testament: 'new' },
  'Colossians': { x: 550, y: 150, testament: 'new' },
  '1 Thessalonians': { x: 400, y: 200, testament: 'new' },
  '2 Thessalonians': { x: 450, y: 200, testament: 'new' },
  '1 Timothy': { x: 500, y: 200, testament: 'new' },
  '2 Timothy': { x: 550, y: 200, testament: 'new' },
  'Titus': { x: 400, y: 250, testament: 'new' },
  'Philemon': { x: 450, y: 250, testament: 'new' },
  'Hebrews': { x: 500, y: 250, testament: 'new' },
  'James': { x: 550, y: 250, testament: 'new' },
  '1 Peter': { x: 400, y: 300, testament: 'new' },
  '2 Peter': { x: 450, y: 300, testament: 'new' },
  '1 John': { x: 500, y: 300, testament: 'new' },
  '2 John': { x: 550, y: 300, testament: 'new' },
  '3 John': { x: 400, y: 350, testament: 'new' },
  'Jude': { x: 450, y: 350, testament: 'new' },
  'Revelation': { x: 500, y: 350, testament: 'new' },
};
