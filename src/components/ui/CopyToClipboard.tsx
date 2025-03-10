import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import Button from './Button';

type CopyToClipboardProps = {
  text: string;
  className?: string;
};

export default function CopyToClipboard({ text, className }: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました', err);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className={className}
      aria-label="クリップボードにコピー"
    >
      {copied ? (
        <>
          <FiCheck className="mr-1" />
          コピー完了
        </>
      ) : (
        <>
          <FiCopy className="mr-1" />
          URLをコピー
        </>
      )}
    </Button>
  );
} 