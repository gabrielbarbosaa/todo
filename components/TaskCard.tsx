"use client";

import React, { useState } from 'react'
import { Id, Task } from '@/core/types/types'
import { FiTrash2 } from 'react-icons/fi';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface IProps {
  task: Task;
  deleteTask:(id:Id) => void;
  updateTask:(id:Id, content:string) => void
}

const TaskCard = (props: IProps) => {
  const {
    task,
    deleteTask,
    updateTask
  } = props;

  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task
    },
    disabled: editMode
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  const toggleEditMode = () => {
    setEditMode((prev) => !prev)
    setMouseIsOver(false)
  };

  if(editMode){
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className='
          bg-mainBackgroundColor
          p-2.5
          h-[100px]
          min-h-[100px]
          items-center
          flex
          text-left
          rounded-xl
          hover:ring-2
          hover:ring-inset
          hover:ring-slate-50
          cursor-grab
          relative
        '
      >
        <textarea
          className='
            h-[90%]
            w-full
            resize-none
            border-none
            rounded
            bg-transparent
            text-white
            focus:outline-none
          '
          autoFocus
          value={task.content}
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if(e.key === "Enter" && e.shiftKey) toggleEditMode();
          }}  
          onChange={(e) => updateTask(task.id, e?.target?.value)}
        />
      </div>
    )
  }

  if(isDragging){
    return (
      <div
        ref={setNodeRef}
        style={style}
        className='
        bg-mainBackgroundColor
          p-2.5
          h-[100px]
          min-h-[100px]
          items-center
          flex
          text-left
          rounded-xl
          hover:ring-2
          hover:ring-inset
          hover:ring-slate-50
          cursor-grab
          relative
          opacity-30
        '
      />
    )
  }

  return (
    <div
      className='
        bg-mainBackgroundColor
        p-2.5
        h-[100px]
        min-h-[100px]
        items-center
        flex
        text-left
        rounded-xl
        hover:ring-2
        hover:ring-inset
        hover:ring-slate-50
        cursor-grab
        relative
        task
      '
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      onClick={toggleEditMode}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <p
        className='
          my-auto
          h-[90%]
          w-full
          overflow-y-auto
          overflow-x-hidden
          whitespace-pre-line
        '
      >
        {task.content}
      </p>
      {mouseIsOver && (
        <button
          className='
            absolute
            right-4
            top-1/2-translate-y-1/2
            bg-columnBackgroundColor
            rounded
          '
          onClick={() => deleteTask(task.id)}
        >
          <FiTrash2 
            className='
              stroke-gray-500
              hover:stroke-white
              hover:bg-columnBackgroundColor
              opacity-50
              hover: opacity-100
            '
          />
        </button>
      )}
    </div>
  )
}

export default TaskCard;