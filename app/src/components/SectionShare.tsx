import React from 'react';
import ShareButton from './ShareButton';

// The "Share" button under home-page section headings. The shared link is the
// site's front page, so people arriving from a share land on the "One
// Classroom" welcome. All the behaviour lives in ShareButton.

interface SectionShareProps {
  /** Short heading for the share, e.g. "The Gospel Message". */
  title: string;
  /** The message or scripture to share. */
  text: string;
  className?: string;
}

const SectionShare: React.FC<SectionShareProps> = ({ title, text, className }) => (
  <ShareButton title={title} text={text} className={className} />
);

export default SectionShare;
