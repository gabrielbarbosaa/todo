"use client"
import React, { useMemo, useState } from 'react'
import { Column, Id, Task } from '@/core/types/types';
import { FiPlusCircle } from 'react-icons/fi';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { createPortal } from 'react-dom';
import ColumnContainer from './ColumnContainer';
import TaskCard from './TaskCard';

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  )

  function createNewColumn (){
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`
    }

    setColumns([...columns, columnToAdd])
  }

  function generateId(){
    // Generete a random number between 0 and 10000
    return Math.floor(Math.random() * 10001)
  }

  function deleteColumn(id: Id){
    const filteredColumn = columns?.filter((col) => col.id !== id);
    setColumns(filteredColumn)

    const newTasks = tasks.filter((t) => t.columnId !== id)
    setTasks(newTasks)
  }

  function updateColumn(id:Id, title: string){
    const newColumns = columns?.map((col) => {
      if(col.id !== id) return col;
      return {...col, title}
    })

    setColumns(newColumns);
  }

  function createTask(columnId: Id){
    const newTask: Task = {
      id: generateId(),
      columnId: columnId,
      content: `Task ${tasks.length + 1}`
    }

    setTasks([...tasks, newTask])
  }

  function deleteTask(taskId: Id){
    const newTasks = tasks.filter((task) => task.id !== taskId);

    setTasks(newTasks)
  }

  function updateTask(taskId: Id, content:string){
    const newTasks = tasks.map((task) => {
      if(task.id !== taskId) return task;
      return {...task, content}
    })

    setTasks(newTasks)
  }

  function onDragStart(event: DragStartEvent){
    if(event.active.data.current?.type === 'Column'){
      setActiveColumn(event.active.data.current.column)
      return;
    }

    if(event.active.data.current?.type === 'Task'){
      setActiveTask(event.active.data.current.task)
      return;
    }
  }

  function onDragEnd(event: DragEndEvent){
    setActiveColumn(null)
    setActiveTask(null)
    const { active, over } = event;

    if(!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if(activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeColumnId);
      const overColumnIndex = columns.findIndex((col) => col.id === overColumnId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex)

    })
  }

  function onDragOver(event: DragOverEvent){
    const { active, over } = event;

    if(!over) return;

    const activeId = active.id;
    const overId = over.id;

    if(activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    //dropping task over another task
    if(isActiveTask && isOverTask){
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);
        tasks[activeIndex].columnId = tasks[overIndex].columnId

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    //dropping task over column
    const isActiveColumn = active.data.current?.type === "Column";

    if(isActiveTask && isActiveColumn){
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        tasks[activeIndex].columnId = overId

        return arrayMove(tasks, activeIndex, activeIndex)
      })
    }
  }

  return (
    <div
      className='
        m-auto
        flex
        min-h-screen
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[40px]
      '
    >
      <DndContext 
        onDragStart={onDragStart} 
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}  
        sensors={sensors}
      >
        <div className='m-auto flex gap-4'>
          <div className='flex gap-2'>
            <SortableContext items={columnsId}>
              {columns?.map((col) => (
                <ColumnContainer 
                  key={col.id} 
                  column={col}
                  deleteColumnId={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={() => createNewColumn()}
            className='
              h-[60px]
              w-[350px]
              min-w-[350px]
              cursor-pointer
              rounded-lg
              bg-columnBackgroundColor
              border-2
              border-columnBackgroundColor
              p-4
              ring-rose-100
              hover:ring-1
              flex
              items-center
              gap-2
            '
          >
            <FiPlusCircle size="16px" />
            Add column
          </button>
        </div>

        {typeof window === "object" && createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer 
                column={activeColumn}
                deleteColumnId={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )
}

export default KanbanBoard