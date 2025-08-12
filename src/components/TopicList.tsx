import React from 'react';
import GenericList from './GenericList';
import TopicListItem from './TopicListItem';
import type { UITopic } from '../types/template';

type Topic = UITopic;

interface TopicListProps {
  topics: Topic[];
  onRenameClick?: (topicName: string) => void;
  onDeleteClick?: (topicName: string) => void;
  onPlusQuestionClick?: (topicName: string) => void;
}

const TopicList: React.FC<TopicListProps> = ({ topics, onRenameClick, onDeleteClick, onPlusQuestionClick }) => {
  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <div style={{ marginLeft: '40px', paddingLeft: '10px', marginTop: '10px' }}>
      <GenericList
        items={topics}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <TopicListItem
            content={item.name}
            onClick={() => console.log('Topic clicked:', item.name)}
            onRenameClick={() => onRenameClick && onRenameClick(item.name)}
            onDeleteClick={() => onDeleteClick && onDeleteClick(item.name)}
            onPlusQuestionClick={() => onPlusQuestionClick && onPlusQuestionClick(item.name)}
          />
        )}
      />
    </div>
  );
};

export default TopicList;
