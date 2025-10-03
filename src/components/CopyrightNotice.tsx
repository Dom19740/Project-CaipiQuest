import React from 'react';

const CopyrightNotice: React.FC = () => {
  return (
    <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400">
      © 2025 <a href="https://www.dpbcreative.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">dpb creative</a>. All rights reserved.
    </div>
  );
};

export default CopyrightNotice;