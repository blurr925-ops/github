import { useState, useRef } from 'react';
import { Camera, Plus, X, Trash2, Filter } from 'lucide-react';
import { usePhotoDB } from '../hooks/usePhotoDB';
import { generateId } from '../utils/storage';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import TagSelector from '../components/common/TagSelector';
import { photoTags } from '../data/defaultTags';

function createThumbnail(file, maxWidth = 200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Photos() {
  const { photos, loading, addPhoto, deletePhoto } = usePhotoDB();
  const fileInputRef = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [eventName, setEventName] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterTag, setFilterTag] = useState('');
  const [filterEvent, setFilterEvent] = useState('');

  const filteredPhotos = photos.filter((p) => {
    if (filterTag && !(p.tags || []).includes(filterTag)) return false;
    if (filterEvent && !(p.eventName || '').toLowerCase().includes(filterEvent.toLowerCase())) return false;
    return true;
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowForm(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const thumbnailBlob = await createThumbnail(selectedFile);
    const photo = {
      id: generateId(),
      blob: selectedFile,
      thumbnail: thumbnailBlob,
      caption: caption.trim(),
      eventName: eventName.trim(),
      tags: selectedTags,
      date: new Date().toISOString(),
    };
    await addPhoto(photo);
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaption('');
    setEventName('');
    setSelectedTags([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openLightbox = (photo) => {
    setLightboxPhoto(photo);
    const url = URL.createObjectURL(photo.blob);
    setLightboxUrl(url);
  };

  const closeLightbox = () => {
    if (lightboxUrl) URL.revokeObjectURL(lightboxUrl);
    setLightboxUrl(null);
    setLightboxPhoto(null);
  };

  const handleDelete = async () => {
    if (!lightboxPhoto) return;
    await deletePhoto(lightboxPhoto.id);
    closeLightbox();
  };

  const allEvents = [...new Set(photos.map((p) => p.eventName).filter(Boolean))];

  return (
    <div className="min-h-screen bg-navy p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Camera className="w-6 h-6 text-tennis" />
          My Photos
        </h1>
        <p className="text-gray-400 text-sm mt-1">Your tennis memories!</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Add Photo button */}
      <Button onClick={() => fileInputRef.current?.click()} className="w-full mb-4">
        <Plus className="w-5 h-5" />
        Add Photo
      </Button>

      {/* Upload form */}
      {showForm && previewUrl && (
        <Card className="mb-4 space-y-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full rounded-xl object-cover max-h-48"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full bg-navy rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 border border-gray-600 focus:border-tennis focus:outline-none min-h-[48px]"
          />
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Event name (e.g. Spring Tournament)"
            className="w-full bg-navy rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 border border-gray-600 focus:border-tennis focus:outline-none min-h-[48px]"
          />
          <p className="text-gray-400 text-xs font-bold">Tags</p>
          <TagSelector tags={photoTags} selected={selectedTags} onChange={setSelectedTags} />
          <div className="flex gap-2">
            <Button onClick={handleUpload} className="flex-1">
              <Camera className="w-5 h-5" />
              Save Photo
            </Button>
            <Button variant="secondary" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Filter bar */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-gray-400 text-sm font-bold mb-3 min-h-[48px] px-2"
      >
        <Filter className="w-4 h-4" />
        {showFilters ? 'Hide Filters' : 'Filter Photos'}
        {(filterTag || filterEvent) && (
          <span className="bg-tennis/20 text-tennis text-xs px-2 py-0.5 rounded-full">Active</span>
        )}
      </button>

      {showFilters && (
        <Card className="mb-4 space-y-3">
          <p className="text-gray-400 text-xs font-bold">Filter by tag</p>
          <div className="flex flex-wrap gap-2">
            <Badge active={!filterTag} onClick={() => setFilterTag('')}>
              All
            </Badge>
            {photoTags.map((tag) => (
              <Badge key={tag} active={filterTag === tag} onClick={() => setFilterTag(filterTag === tag ? '' : tag)}>
                {tag}
              </Badge>
            ))}
          </div>
          {allEvents.length > 0 && (
            <>
              <p className="text-gray-400 text-xs font-bold">Filter by event</p>
              <div className="flex flex-wrap gap-2">
                <Badge active={!filterEvent} onClick={() => setFilterEvent('')}>
                  All
                </Badge>
                {allEvents.map((ev) => (
                  <Badge key={ev} active={filterEvent === ev} onClick={() => setFilterEvent(filterEvent === ev ? '' : ev)}>
                    {ev}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Photo grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Loading photos...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No photos yet.</p>
          <p className="text-gray-500 text-xs mt-1">Tap "Add Photo" to save your best moments!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredPhotos.map((photo) => {
            const thumbUrl = photo.thumbnail
              ? URL.createObjectURL(photo.thumbnail)
              : photo.blob
                ? URL.createObjectURL(photo.blob)
                : null;
            return (
              <div
                key={photo.id}
                onClick={() => openLightbox(photo)}
                className="cursor-pointer active:scale-[0.97] transition-transform"
              >
                <div className="bg-navy-light rounded-2xl overflow-hidden shadow-lg">
                  {thumbUrl && (
                    <img
                      src={thumbUrl}
                      alt={photo.caption || 'Tennis photo'}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-2">
                    {photo.caption && (
                      <p className="text-white text-xs font-bold truncate">{photo.caption}</p>
                    )}
                    {photo.eventName && (
                      <p className="text-gray-400 text-[10px] truncate">{photo.eventName}</p>
                    )}
                    <p className="text-gray-500 text-[10px]">
                      {new Date(photo.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && lightboxUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white p-3 min-w-[48px] min-h-[48px] flex items-center justify-center bg-navy-lighter rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Full image */}
          <img
            src={lightboxUrl}
            alt={lightboxPhoto.caption || 'Tennis photo'}
            className="max-w-full max-h-[70vh] rounded-2xl object-contain"
          />

          {/* Photo info */}
          <div className="mt-4 text-center">
            {lightboxPhoto.caption && (
              <p className="text-white font-bold">{lightboxPhoto.caption}</p>
            )}
            {lightboxPhoto.eventName && (
              <p className="text-gray-400 text-sm">{lightboxPhoto.eventName}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {new Date(lightboxPhoto.date).toLocaleDateString()}
            </p>
            {(lightboxPhoto.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {lightboxPhoto.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-navy-lighter text-gray-300 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Delete button */}
          <Button variant="danger" onClick={handleDelete} className="mt-6">
            <Trash2 className="w-5 h-5" />
            Delete Photo
          </Button>
        </div>
      )}
    </div>
  );
}
