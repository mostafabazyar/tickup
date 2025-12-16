import React, { useState, useEffect } from 'react';
// FIX: Add missing imports for Strategy and Index
import { Objective, Project, User, Strategy, Index } from '../types';
import Modal from './Modal';
import { CategorySelector, IndexSelector, ParentObjectiveSelector } from './ObjectiveSelectors';
import { OBJECTIVE_COLOR_OPTIONS, OBJECTIVE_COLOR_MAP } from '../constants';
import DueDateSelector from './DueDateSelector';


interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  objectives: Objective[];
  users: User[];
  onSubmit: (updatedProject: Project) => void;
  onArchive: (projectId: string) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, project, objectives, users, onSubmit, onArchive }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [missionStatement, setMissionStatement] = useState('');
  const [objectiveId, setObjectiveId] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [isDefault, setIsDefault] = useState(false);


  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setMissionStatement(project.missionStatement || '');
      setObjectiveId(project.objectiveId);
      setMemberIds(project.memberIds || []);
      setIsDefault(project.isDefault || false);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !objectiveId) {
        alert('نام پروژه و هدف مرتبط الزامی است.');
        return;
    }
    onSubmit({
      ...project,
      name: name.trim(),
      description: description.trim(),
      missionStatement: missionStatement.trim(),
      objectiveId,
      memberIds,
      isDefault,
    });
  };
  
  const handleFieldChange = (field: keyof Omit<Project, 'id'>, value: any) => {
    switch (field) {
        case 'name': setName(value); break;
        case 'description': setDescription(value); break;
        case 'missionStatement': setMissionStatement(value); break;
        case 'objectiveId': setObjectiveId(value); break;
        case 'memberIds': setMemberIds(value); break;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ویرایش پروژه">
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div>
          <label htmlFor="proj-name" className="block text-sm font-medium text-brand-text">نام پروژه</label>
          <input
            id="proj-name"
            type="text"
            value={name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            required
            className="mt-1 block w-full input-style"
          />
        </div>

        <div>
          <label htmlFor="proj-desc" className="block text-sm font-medium text-brand-text">توضیحات پروژه</label>
          <textarea
            id="proj-desc"
            value={description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            rows={3}
            className="mt-1 block w-full input-style"
          ></textarea>
        </div>

        <div>
          <label htmlFor="proj-mission" className="block text-sm font-medium text-brand-text">بیانیه پروژه</label>
          <textarea
            id="proj-mission"
            value={missionStatement}
            onChange={(e) => handleFieldChange('missionStatement', e.target.value)}
            rows={3}
            className="mt-1 block w-full input-style"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="proj-objective" className="block text-sm font-medium text-brand-text">هدف مرتبط</label>
          <select
            id="proj-objective"
            value={objectiveId}
            onChange={(e) => handleFieldChange('objectiveId', e.target.value)}
            className="input-style mt-1"
          >
            {objectives.filter(o => !o.isArchived).map(obj => (
              <option key={obj.id} value={obj.id}>{obj.title}</option>
            ))}
          </select>
        </div>
        
         <div>
          <label className="block text-sm font-medium text-brand-text">اعضا</label>
          {/* FIX: Explicitly type the 'option' parameter as HTMLOptionElement to resolve the type error. */}
          <select multiple value={memberIds} onChange={(e) => handleFieldChange('memberIds', Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="input-style p-3 text-base h-32">
              {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </div>

        <div className="flex items-center pt-4 border-t">
          <input
            id="is-default-proj"
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded ml-2"
          />
          <label htmlFor="is-default-proj" className="text-sm font-medium text-brand-text">
            تنظیم به عنوان پروژه پیش فرض
          </label>
        </div>


        <div className="flex justify-between items-center pt-4 mt-4 border-t">
          <button
            type="button"
            onClick={() => {
                if(window.confirm('آیا از آرشیو کردن این پروژه اطمینان دارید؟')) {
                    onArchive(project.id);
                    onClose();
                }
            }}
            className="text-sm font-medium text-yellow-600 hover:text-yellow-800"
          >
            آرشیو پروژه
          </button>
          <div className="flex space-x-2 space-x-reverse">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">لغو</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-700">ذخیره</button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectModal;