import './Challenge.css';
import styled from 'styled-components/macro';
import { useEffect, useState } from 'react';

import { WEIGHTS } from '../../utils/constants';
import {
  getHtmlMessage,
  getHtmlReplyButton,
  getHtmlReply,
  getHtmlReplyContainer,
  useFetchMessages,
} from '../../messages';
import { getCurrentMonth, getCurrentYearString } from '../../utils/date';
import YearDropdown from '../../components/YearDropdown';
import MonthDropdown from '../../components/MonthDropdown';
import Loader from '../../components/Loader/Loader';

import '@reach/listbox/styles.css';

const Challenge = () => {
  const [messagesHtml, setMessagesHtml] = useState('');
  const [date, setDate] = useState(() => ({
    year: getCurrentYearString(),
    month: getCurrentMonth(),
  }));
  const [year, setYear] = useState(getCurrentYearString());
  const [month, setMonth] = useState(getCurrentMonth());
  const { isLoading, error, data: messages } = useFetchMessages(date.year, date.month);

  useEffect(() => {
    if (messages?.length > 0) {
      const messagesText = [];
      for (const message of messages) {
        const replies = message.replies;
        if (replies) {
          messagesText.push(getHtmlMessage(replies[0].text));
          const replyId = message.client_msg_id || message.ts;
          messagesText.push(getHtmlReplyButton(replyId));
          let htmlReplies = '';
          for (let i = 1; i < replies.length; i += 1) {
            htmlReplies += getHtmlReply(replies[i].text);
          }
          messagesText.push(getHtmlReplyContainer(htmlReplies, replyId));
        } else {
          messagesText.push(getHtmlMessage(message.text));
        }
      }
      setMessagesHtml(messagesText.join(''));
    }
  }, [messages]);

  const handleSearch = () => {
    setDate({
      year,
      month,
    });
  };

  function handleMessageClick(ev) {
    const { id = null } = ev.target.dataset;
    const hideReplyContainerClassname = 'reply-container-hide';
    const hideButtonReplyClassname = 'button-reply-hide';
    const openButtonReplyId = `js-button-open-reply-${id}`;
    const closeButtonReplyId = `js-button-close-reply-${id}`;

    if (ev.target.id === openButtonReplyId) {
      const repliesContainer = document.getElementById(id);
      if (repliesContainer) {
        if (repliesContainer.classList.contains(hideReplyContainerClassname)) {
          repliesContainer.classList.remove(hideReplyContainerClassname);
          ev.target.classList.add(hideButtonReplyClassname);
          const closeButton = document.getElementById(closeButtonReplyId);
          closeButton.classList.remove(hideButtonReplyClassname);
        }
      }
    } else if (ev.target.id === closeButtonReplyId) {
      const repliesContainer = document.getElementById(id);
      if (repliesContainer) {
        if (repliesContainer.classList.contains(hideReplyContainerClassname) === false) {
          repliesContainer.classList.add(hideReplyContainerClassname);
          ev.target.classList.add(hideButtonReplyClassname);
          const showButton = document.getElementById(openButtonReplyId);
          showButton.classList.remove(hideButtonReplyClassname);
        }
      }
    }
  }

  function displayMessages() {
    if (error) {
      return <MessageEmpty role="alert">{error.message}</MessageEmpty>;
    }
    if (isLoading) {
      return <Loader />;
    }
    if (messages?.length > 0) {
      return <MessageWrapper onClick={handleMessageClick} dangerouslySetInnerHTML={{ __html: messagesHtml }} />;
    }
    return (
      <MessageEmpty>
        No messages found for {date.month} {date.year}
      </MessageEmpty>
    );
  }

  return (
    <>
      <ContentTitle>Octalysis Mini&nbsp;Challenge</ContentTitle>
      <DateWrapper>
        <YearDropdown year={year} setYear={setYear} />
        <MonthDropdown month={month} setMonth={setMonth} />
        <SearchButton type="button" onClick={handleSearch}>
          Search
        </SearchButton>
      </DateWrapper>
      {displayMessages()}
    </>
  );
};

const ContentTitle = styled.h2`
  text-align: center;
  margin-bottom: 32px;
  font-size: 1.5rem;
  font-weight: ${WEIGHTS.bold};
`;

const DateWrapper = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
`;

const SearchButton = styled.button`
  background-color: var(--color-blue);
  color: var(--color-white);
  width: 100px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;

  &:hover {
    background-color: hsl(191.7deg 63.1% 47.8% / 80%);
  }
`;

const MessageWrapper = styled.div`
  white-space: pre-wrap;
  padding-top: 32px;
`;

const MessageEmpty = styled.div`
  margin-top: 64px;
  padding: 8px;
  text-align: center;
  background-color: var(--color-white);
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 hsl(0 0% 0% / 10%), 0 1px 2px 0 hsl(0 0% 0% / 6%);
`;

export default Challenge;
