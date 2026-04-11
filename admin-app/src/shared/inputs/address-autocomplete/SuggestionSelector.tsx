import { useMemo } from 'react'
import type { PlaceSuggestion, SavedLocation } from './types'
import { CurrentLocationCard } from './components/CurrentLocationCard'
import { SavedLocationCard } from './components/SavedLocationCard'
import { useAddressAutocompleteContext } from './AddressAutocomplete.context'
import { getSavedLocations } from './utils/savedLocationsStorage'

type PropsSuggestionCard = {
    suggestion: PlaceSuggestion 

}


export const SuggestionCard = ({
    suggestion,
    
}: PropsSuggestionCard)=>{

    const { handleSelectionAddress, handleToogle } = useAddressAutocompleteContext()

    const onSelect = ()=>{  

        
        requestAnimationFrame(()=>{
            (document.activeElement as HTMLElement | null)?.blur()
        })
        handleSelectionAddress( suggestion )
        handleToogle({ value: false });
    }
    return(
        <li key={suggestion.placeId}>
            <div
               
                className="flex w-full flex-col gap-0.5 px-3 py-3 text-left text-xs hover:bg-[var(--color-ligth-bg)] cursor-pointer"
                onMouseDown={(event) => {
                    event.preventDefault()
                    onSelect()
                }}

            >
            <span className="font-medium text-[var(--color-text)]">{suggestion.mainText ?? suggestion.description}</span>
            {suggestion.secondaryText && (
                <span className="text-xs text-[var(--color-muted)]">{suggestion.secondaryText}</span>
            )}
            </div>
      </li>
    )
}


export const SuggestionsSelector = () => {
    const {
      isLoading,
      suggestions,
      inputValue,
      isOpen,
      enableCurrentLocation,
      enableSavedLocations,
      intentKey,
      handleUseCurrentLocation,
      handleSelectSavedLocation,
      savedLocationsRevision,
    } = useAddressAutocompleteContext()

    const isTyping = inputValue.trim().length > 0

    const savedLocations = useMemo(() => {
      if (!enableSavedLocations || !intentKey?.trim()) return []
      return getSavedLocations(intentKey)
    }, [enableSavedLocations, intentKey, savedLocationsRevision, isOpen])

    const handleSavedLocationSelect = (saved: SavedLocation) => {
      requestAnimationFrame(() => {
        (document.activeElement as HTMLElement | null)?.blur()
      })
      handleSelectSavedLocation(saved.address)
    }


    if (!isTyping && !isLoading) {
        return ( 
            <ul>
                {enableCurrentLocation ? (
                  <CurrentLocationCard onSelect={handleUseCurrentLocation} />
                ) : null}
                {savedLocations.map((saved) => (
                  <SavedLocationCard
                    key={`saved_${saved.id}`}
                    savedLocation={saved}
                    onSelect={handleSavedLocationSelect}
                  />
                ))}
            </ul>
        );

    }

    if ( !isLoading && suggestions.length ){
        return ( 
            <ul>
                { suggestions.map(( suggestion, i ) => (
                    <SuggestionCard
                        key={ 'suggestion_' + i }
                        suggestion={suggestion}
                    />
                )) } 
    
            </ul>
        );

    }else if( isLoading ){
        return(
            <div className="text-xs text-[var(--color-muted)">
                is Loading
            </div>
        )
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="text-xs text-red-800 flex justify-center">
            <span >   
                No matches. Try refining your search.
            </span>
        </div>
        {enableCurrentLocation ? <CurrentLocationCard onSelect={handleUseCurrentLocation} /> : null}
        {savedLocations.length ? (
          <ul>
            {savedLocations.map((saved) => (
              <SavedLocationCard
                key={`saved_fallback_${saved.id}`}
                savedLocation={saved}
                onSelect={handleSavedLocationSelect}
              />
            ))}
          </ul>
        ) : null}
      </div>
    )
}
