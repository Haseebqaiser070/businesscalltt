import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'

export default function TagsInput({ tags, setTags }) {
  const [input, setInput] = useState('')

  // When user types comma or presses Enter → add tag
  const handleKeyDown = (e) => {
    const val = input.trim()
    if ((e.key === 'Enter' || e.key === ',') && val) {
      e.preventDefault()
      if (!tags.includes(val)) {
        setTags([...tags, val])
      }
      setInput('')
    }
  }

  // Remove a tag by index
  const removeTag = (idx) => {
    setTags(tags.filter((_, i) => i !== idx))
  }

  return (
    <div className="tags-input">
      <input
        className="form-control form-control-lg"
        type="text"
        value={input}
        placeholder="Type and press enter/comma to add tags"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="tags-container mt-2">
        {tags.map((t, i) => (
          <span key={i} className="tag-pill">
            {t}
            <span className="mx-2" onClick={() => removeTag(i)}>
              <FontAwesomeIcon icon={faCircleXmark} />
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
