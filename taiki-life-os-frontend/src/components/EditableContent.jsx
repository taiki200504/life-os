import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Save, X, Plus, Trash2 } from 'lucide-react';

const EditableText = ({ value, onSave, placeholder = "クリックして編集", multiline = false, className = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (multiline) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
      }
    }
  }, [isEditing, multiline]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    return (
      <div className="relative">
        <InputComponent
          ref={inputRef}
          type={multiline ? undefined : "text"}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full px-2 py-1 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${className} ${
            multiline ? 'resize-none min-h-[60px]' : ''
          }`}
          placeholder={placeholder}
        />
        <div className="flex gap-1 mt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
          >
            <Save className="w-3 h-3" />
            保存
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
          >
            <X className="w-3 h-3" />
            キャンセル
          </button>
        </div>
        {multiline && (
          <p className="text-xs text-gray-500 mt-1">Ctrl+Enterで保存、Escでキャンセル</p>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`group cursor-pointer hover:bg-gray-50 rounded p-2 -m-2 transition-colors ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex-1 ${!value ? 'text-gray-400 italic' : ''}`}>
          {multiline ? (
            <div className="whitespace-pre-wrap">{value || placeholder}</div>
          ) : (
            <span>{value || placeholder}</span>
          )}
        </div>
        <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
      </div>
    </div>
  );
};

const EditableList = ({ items, onUpdate, title, addButtonText = "項目を追加" }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim()) {
      onUpdate([...items, newItem.trim()]);
      setNewItem('');
      setIsAdding(false);
    }
  };

  const handleUpdateItem = (index, newValue) => {
    const updatedItems = [...items];
    updatedItems[index] = newValue;
    onUpdate(updatedItems);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdate(updatedItems);
  };

  return (
    <div className="space-y-3">
      {title && <h4 className="font-medium text-gray-900">{title}</h4>}
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 group">
            <div className="flex-1">
              <EditableText
                value={item}
                onSave={(newValue) => handleUpdateItem(index, newValue)}
                placeholder="項目を入力"
              />
            </div>
            <button
              onClick={() => handleDeleteItem(index)}
              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddItem();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            placeholder="新しい項目を入力"
            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />
          <button
            onClick={handleAddItem}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            追加
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            キャンセル
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          {addButtonText}
        </button>
      )}
    </div>
  );
};

const EditableSection = ({ title, icon: Icon, children, collapsible = true }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div
        className={`p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 ${
          collapsible ? 'cursor-pointer hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100' : ''
        }`}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-purple-600" />}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {collapsible && (
            <div className={`transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

export { EditableText, EditableList, EditableSection };

