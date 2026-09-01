import React, { useState, useMemo } from 'react';
import { 
  X, ZoomIn, ZoomOut, Maximize2, Filter, 
  BookOpen, ArrowRight, Info, Sparkles
} from 'lucide-react';
import { verseConnections, bookPositions, VerseConnection, thematicGroups } from '@/data/crossReferences';
import { oldTestament, newTestament } from '@/data/bibleData';

interface VerseConnectionMapProps {
  isOpen: boolean;
  onClose: () => void;
  currentReference?: string;
  onNavigateToVerse?: (reference: string) => void;
}

const connectionTypeColors: Record<string, string> = {
  direct: '#14B8A6',
  parallel: '#3B82F6',
  thematic: '#8B5CF6',
  prophetic: '#F59E0B',
  quotation: '#EC4899',
};

const VerseConnectionMap: React.FC<VerseConnectionMapProps> = ({
  isOpen,
  onClose,
  currentReference,
  onNavigateToVerse,
}) => {
  const [zoom, setZoom] = useState(1);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Parse current reference to get book
  const currentBook = currentReference?.split(' ').slice(0, -1).join(' ') || null;

  // Filter connections based on selected filters
  const filteredConnections = useMemo(() => {
    let connections = verseConnections;
    
    if (filterType) {
      connections = connections.filter(c => c.type === filterType);
    }
    
    if (selectedBook) {
      connections = connections.filter(
        c => c.sourceBook === selectedBook || c.targetBook === selectedBook
      );
    }
    
    return connections;
  }, [filterType, selectedBook]);

  // Get unique books that have connections
  const connectedBooks = useMemo(() => {
    const books = new Set<string>();
    verseConnections.forEach(c => {
      books.add(c.sourceBook);
      books.add(c.targetBook);
    });
    return Array.from(books);
  }, []);

  // Calculate SVG dimensions
  const svgWidth = 700;
  const svgHeight = 450;

  // Get book position with fallback
  const getBookPos = (book: string) => {
    return bookPositions[book] || { x: 300, y: 200, testament: 'new' as const };
  };

  // Draw connection line
  const renderConnection = (conn: VerseConnection, index: number) => {
    const sourcePos = getBookPos(conn.sourceBook);
    const targetPos = getBookPos(conn.targetBook);
    
    const isHighlighted = 
      conn.sourceBook === currentBook || 
      conn.targetBook === currentBook ||
      conn.sourceBook === selectedBook ||
      conn.targetBook === selectedBook;

    const opacity = isHighlighted ? 0.8 : 0.3;
    const strokeWidth = isHighlighted ? 2 : 1;

    // Calculate control point for curved line
    const midX = (sourcePos.x + targetPos.x) / 2;
    const midY = (sourcePos.y + targetPos.y) / 2;
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const curveOffset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.3;
    const controlX = midX + (dy > 0 ? curveOffset : -curveOffset);
    const controlY = midY + (dx > 0 ? -curveOffset : curveOffset);

    return (
      <g key={index}>
        <path
          d={`M ${sourcePos.x} ${sourcePos.y} Q ${controlX} ${controlY} ${targetPos.x} ${targetPos.y}`}
          stroke={connectionTypeColors[conn.type]}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={opacity}
          className="transition-all duration-300"
        />
        {isHighlighted && (
          <circle
            cx={midX}
            cy={midY}
            r={3}
            fill={connectionTypeColors[conn.type]}
            opacity={0.8}
          />
        )}
      </g>
    );
  };

  // Render book node
  const renderBookNode = (book: string) => {
    const pos = getBookPos(book);
    const isConnected = connectedBooks.includes(book);
    const isCurrentBook = book === currentBook;
    const isSelected = book === selectedBook;
    const isHighlighted = isCurrentBook || isSelected;

    if (!isConnected && !isCurrentBook) return null;

    const connectionCount = verseConnections.filter(
      c => c.sourceBook === book || c.targetBook === book
    ).length;

    return (
      <g
        key={book}
        className="cursor-pointer"
        onClick={() => setSelectedBook(selectedBook === book ? null : book)}
      >
        {/* Glow effect for highlighted */}
        {isHighlighted && (
          <circle
            cx={pos.x}
            cy={pos.y}
            r={22}
            fill={isCurrentBook ? '#14B8A6' : '#3B82F6'}
            opacity={0.2}
            className="animate-pulse"
          />
        )}
        
        {/* Main circle */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r={16}
          fill={isHighlighted ? (isCurrentBook ? '#14B8A6' : '#3B82F6') : pos.testament === 'old' ? '#1e3a5f' : '#1e3a5f'}
          stroke={isHighlighted ? '#fff' : pos.testament === 'old' ? '#14B8A6' : '#3B82F6'}
          strokeWidth={isHighlighted ? 2 : 1}
          className="transition-all duration-300 hover:stroke-white"
        />
        
        {/* Connection count badge */}
        {connectionCount > 0 && (
          <>
            <circle
              cx={pos.x + 12}
              cy={pos.y - 12}
              r={8}
              fill="#F59E0B"
            />
            <text
              x={pos.x + 12}
              y={pos.y - 8}
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
            >
              {connectionCount}
            </text>
          </>
        )}
        
        {/* Book abbreviation */}
        <text
          x={pos.x}
          y={pos.y + 4}
          textAnchor="middle"
          fill="white"
          fontSize="7"
          fontWeight="500"
        >
          {book.length > 6 ? book.substring(0, 5) : book}
        </text>
      </g>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] border border-[#14B8A6]/30 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#14B8A6]/20 to-[#3B82F6]/20 px-6 py-4 border-b border-[#14B8A6]/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Scripture Connection Map</h2>
              <p className="text-white/50 text-sm">
                {currentReference ? `Viewing connections for ${currentReference}` : 'Explore how verses connect across the Bible'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-white/60 text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-white/40" />
            <select
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value || null)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#14B8A6]"
            >
              <option value="">All Types</option>
              <option value="direct">Direct References</option>
              <option value="parallel">Parallel Passages</option>
              <option value="thematic">Thematic</option>
              <option value="prophetic">Prophetic</option>
              <option value="quotation">Quotations</option>
            </select>
            
            {selectedBook && (
              <button
                onClick={() => setSelectedBook(null)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-[#3B82F6]/20 text-[#3B82F6] rounded-lg text-sm"
              >
                <span>{selectedBook}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Info Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg transition-colors ${
              showInfo ? 'bg-[#14B8A6] text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Map Area */}
          <div className="flex-1 p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div 
              className="bg-[#0a1525] rounded-xl border border-white/10 overflow-hidden"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: `${svgWidth}px`,
                height: `${svgHeight}px`
              }}
            >
              <svg width={svgWidth} height={svgHeight} className="w-full h-full">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Testament Labels */}
                <text x="150" y="25" fill="rgba(20, 184, 166, 0.5)" fontSize="14" fontWeight="bold">
                  Old Testament
                </text>
                <text x="450" y="25" fill="rgba(59, 130, 246, 0.5)" fontSize="14" fontWeight="bold">
                  New Testament
                </text>

                {/* Divider line */}
                <line x1="320" y1="30" x2="320" y2="420" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />

                {/* Connection lines */}
                <g>
                  {filteredConnections.map((conn, idx) => renderConnection(conn, idx))}
                </g>

                {/* Book nodes */}
                <g>
                  {Object.keys(bookPositions).map(book => renderBookNode(book))}
                </g>
              </svg>
            </div>
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="w-72 border-l border-white/10 p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              <h3 className="text-white font-semibold mb-3">Connection Types</h3>
              <div className="space-y-2 mb-6">
                {Object.entries(connectionTypeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                    <span className="text-white/70 text-sm capitalize">{type}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-white font-semibold mb-3">Statistics</h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total Connections</span>
                  <span className="text-white">{verseConnections.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Books Connected</span>
                  <span className="text-white">{connectedBooks.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Filtered Showing</span>
                  <span className="text-white">{filteredConnections.length}</span>
                </div>
              </div>

              <h3 className="text-white font-semibold mb-3">How to Use</h3>
              <ul className="text-white/50 text-sm space-y-2">
                <li className="flex items-start space-x-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-[#14B8A6]" />
                  <span>Click on a book to highlight its connections</span>
                </li>
                <li className="flex items-start space-x-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-[#14B8A6]" />
                  <span>Use filters to show specific connection types</span>
                </li>
                <li className="flex items-start space-x-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-[#14B8A6]" />
                  <span>Zoom in/out to explore details</span>
                </li>
                <li className="flex items-start space-x-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-[#14B8A6]" />
                  <span>Numbers show connection count per book</span>
                </li>
              </ul>

              {selectedBook && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-3">{selectedBook} Connections</h3>
                  <div className="space-y-2">
                    {filteredConnections
                      .filter(c => c.sourceBook === selectedBook || c.targetBook === selectedBook)
                      .slice(0, 5)
                      .map((conn, idx) => (
                        <button
                          key={idx}
                          onClick={() => onNavigateToVerse?.(`${conn.sourceBook} ${conn.sourceChapter}:${conn.sourceVerse}`)}
                          className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: connectionTypeColors[conn.type] }}
                            />
                            <span className="text-white text-xs">
                              {conn.sourceBook} {conn.sourceChapter}:{conn.sourceVerse}
                            </span>
                            <ArrowRight className="w-3 h-3 text-white/30" />
                            <span className="text-white text-xs">
                              {conn.targetBook} {conn.targetChapter}:{conn.targetVerse}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerseConnectionMap;
