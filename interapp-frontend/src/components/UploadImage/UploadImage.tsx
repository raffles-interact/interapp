'use client';

import { useRef, useState } from 'react';
import { Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import './styles.css';

export interface UploadImageProps {
  onChange: (imageURL: string, file: File) => void;
  accept: string[];
  defaultImageURL?: string;
  className?: string;
}

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      if (fileReader.result !== null) resolve(String(fileReader.result));
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};

const UploadImage = ({ onChange, defaultImageURL, className, accept }: UploadImageProps) => {
  const [imageURL, setImageURL] = useState(defaultImageURL ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    // validate file
    if (!accept.includes(file.type)) {
      notifications.show({
        title: 'Invalid file type',
        message: `File type ${file.type} is not supported`,
        color: 'red',
      });
      event.target.value = '';
      event.target.files = null;
      setImageURL('');
      return;
    }
    const blob = URL.createObjectURL(file);
    setImageURL(blob);
    onChange(blob, file);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type='file'
        accept={accept.join(',')}
        onChange={handleFileChange}
        className='upload-image-file-input'
      />
      {imageURL === '' ? (
        <div className='upload-image-placeholder' onClick={() => inputRef.current?.click()}>
          <Text>Upload an image</Text>
        </div>
      ) : (
        <img
          src={imageURL}
          className='upload-image-preview'
          onClick={() => inputRef.current?.click()}
          alt='upload-image-preview'
        />
      )}
    </div>
  );
};

export default UploadImage;
