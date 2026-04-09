import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { searchPlaces } from '../api.js';

export function PlaceAutocomplete({
  value,
  onChange,
  selectedPlace,
  onSelectPlace,
  label = 'Place',
  placeholder = 'Search a city, town, or postal code',
}) {
  const deferredValue = useDeferredValue(value);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const query = String(deferredValue || '').trim();
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchPlaces(query);
        if (!cancelled) {
          setResults(data.results || []);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [deferredValue]);

  const helperText = useMemo(() => {
    if (selectedPlace) {
      return selectedPlace.label || selectedPlace.name;
    }
    if (loading) {
      return 'Searching places...';
    }
    if ((value || '').trim().length < 2) {
      return 'Type at least 2 characters to search';
    }
    return `${results.length} place${results.length === 1 ? '' : 's'} found`;
  }, [loading, results.length, selectedPlace, value]);

  return (
    <div className={label ? 'field' : ''}>
      {label ? (
        <div className="field-head">
          <label>{label}</label>
          <span className="field-hint">{helperText}</span>
        </div>
      ) : (
        <div className="field-hint" style={{ fontSize: '.82rem', marginBottom: '.2rem' }}>{helperText}</div>
      )}

      <div className="autocomplete">
        <input
          className="text-input"
          placeholder={placeholder}
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onChange(event.target.value);
            onSelectPlace(null);
            setOpen(true);
          }}
        />

        {open && results.length > 0 ? (
          <div className="autocomplete-menu">
            {results.map((place) => (
              <button
                key={`${place.id}-${place.latitude}`}
                className="autocomplete-item"
                type="button"
                onClick={() => {
                  onSelectPlace(place);
                  onChange(place.label);
                  setOpen(false);
                }}
              >
                <strong>{place.name}</strong>
                <span>{place.admin1 ? `${place.admin1}, ` : ''}{place.country}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {selectedPlace ? (
        <div className="selected-place">
          <span>{selectedPlace.label}</span>
          <span>
            {selectedPlace.latitude.toFixed(4)}, {selectedPlace.longitude.toFixed(4)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

