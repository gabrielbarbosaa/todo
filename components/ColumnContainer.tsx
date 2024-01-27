"use client"
import React, { useMemo, useState } from 'react';
import { Column, Id, Task } from '@/core/types/types';
import { FiTrash2 } from 'react-icons/fi';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

interface IProps {
  column: Column;
  deleteColumnId:(id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  
  tasks: Task[];
  createTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content:string) => void
}

const ColumnContainer = (props:IProps) => {
  const { column, deleteColumnId, updateColumn, createTask, tasks, deleteTask, updateTask } = props;
  const [editMode, setEditMode] = useState(false);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column
    },
    disabled: editMode
  })

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id)
  }, [tasks])

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if(isDragging){
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className='
          bg-columnBackgroundColor
          opacity-40
          border-2
          ring-rose-100
          w-[350px]
          h-[500px]
          max-h-[500px]
          flex
          flex-col
        '
      >
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='
        bg-columnBackgroundColor
        w-[350px]
        h-[500px]
        max-h-[500px]
        flex
        flex-col
      '
    >
      {/* Column title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className='
          bg-mainBackgroundColor
          text-md
          h-[60px]
          cursor-grab
          rounded-md
          rounded-b-none
          p-3
          font-bold
          border-columnBackgroundColor
          border-4
          flex
          items-center
          justify-between
        '
      >
        <div className='flex gap-2'>
          <span
            className='
              flex
              justify-center
              items-center
              bg-columnBackgroundColor
              px-2
              py-1
              text-sm
              rounded-full
            '
          >
            0
          </span>
          <h3>
            {!editMode && column?.title}
            {editMode && (
              <input 
                autoFocus
                value={column.title}
                onBlur={() => setEditMode(false)}
                onChange={(e) => {
                  updateColumn(column.id, e?.target?.value)
                }}
                onKeyDown={(e) => {
                  if(e.key !== "Enter") return;
                  setEditMode(false)
                }}
                className='
                  bg-black
                  focus:border-white
                  border
                  rounded
                  outline-none
                  px-2
                '
              />
            )}
          </h3>
        </div>
        <button
          className=''
          onClick={() => deleteColumnId(column?.id)}
        >
          <FiTrash2 
            className='
              stroke-gray-500
              hover:stroke-white
              hover:bg-columnBackgroundColor
            '
          />
        </button>
      </div>

      {/* Column task container */}
      <div
        className='
          flex
          flex-grow
          flex-col
          gap-4
          p-2
          overflow-x-hidden
          overflow-y-auto
        '
      >
        {tasks.map((task) => (
          <SortableContext items={tasksIds} key={task.id}>
            <TaskCard 
              key={task.id} 
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          </SortableContext>
        ))}
      </div>

      {/* Column footer */}
      <button
        className='
          flex 
          gap-2
          items-center
          border-columnBackgroundColor
          border-2
          rounded-md
          p-4
          border-x-columnBackgroundColor
          hover:bg-mainBackgroundColor
          hover:text-rose-50
          active:bg-black
        '
        onClick={() => createTask(column.id)}
      >
        <FiTrash2 
          className='
            stroke-gray-500
            hover:stroke-white
            hover:bg-columnBackgroundColor
          '
        />
        Add task
      </button>
    </div>
  )
}

export default ColumnContainer