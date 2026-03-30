import Badge from './Badge';

export default function TagSelector({ tags, selected, onChange }) {
  const toggle = (tag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} active={selected.includes(tag)} onClick={() => toggle(tag)}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}
