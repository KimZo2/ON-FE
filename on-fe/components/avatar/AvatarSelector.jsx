import AvatarPreview from "./AvatarPreview";

export default function AvatarSelector({
  characters,
  selectedIndex,
  onSelect,
  nickname,
  onChangeNickname,
}) {
  return (
    <div className="h-fit border border-white rounded-xl p-[2rem]">
      {/* TODO: 닉네임 변경 */}
      {/* 캐릭터 선택 */}
      <p className="text-3xl mb-[1rem] text-gray-300 font-bold">캐릭터 선택</p>
      <p className="text-gray-400 mb-[2rem]">아래 캐릭터 중 원하는 캐릭터를 선택해주세요!</p>
      <div className="grid grid-cols-3 gap-[2rem]">
        {characters.map((char, index) => (
          <button
            key={char.id}
            onClick={() => onSelect(index)}
            className={`p-[1rem] rounded-lg border transition
              ${
                selectedIndex === index
                  ? 'border-yellow-500'
                  : 'border-gray-800/20 hover:border-gray-500'
              }
            `}
          >
            <AvatarPreview character={char} />
            
          </button>
        ))}
      </div>
    </div>
  );
}
