import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import { InputField } from '@/shared/inputs/InputField'
import { BoldArrowIcon } from '@/assets/icons'
import { useMemberSelectorContext } from './MemberSelector.context'
import { MemberSelectorMemberList } from './MemberSelectorMemberList'
import { MemberAvatar } from '../MemberAvatar'

export const MemberSelectorLayout = () => {
  const {
    isOpen,
    inputValue,
    selectedMember,
    inputRef,
    handleOpenChange,
    handleInputFocus,
    handleInputChange,
  } = useMemberSelectorContext()

  const displayValue = selectedMember?.username ?? inputValue

  return (
    <FloatingPopover
      open={isOpen}
      onOpenChange={handleOpenChange}
      classes="relative w-full"
      matchReferenceWidth
      floatingClassName="z-[180]"
      reference={
        <div className="custom-field-container rounded-xl " onClick={handleInputFocus}>

          { selectedMember && 
            <MemberAvatar username={selectedMember.username} className={'mr-2'}/>
          }

          <InputField
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Select a member"
            inputRef={inputRef}
            fieldClassName="w-full"
          />

          <div className="flex items-center content-center pr-2"
            onClick={()=> {
              requestAnimationFrame(()=>{
                handleOpenChange( !isOpen )
              })
            }}
          >
            <BoldArrowIcon className={`h-3 w-3 ${
              isOpen ?  'rotate-270' : 'rotate-90'
            }`} />
          </div>

        </div>
      }
    > 
      
      <div className="admin-glass-popover rounded-2xl p-2 shadow-xl">
        <MemberSelectorMemberList />
      </div>
    </FloatingPopover>
  )
}
