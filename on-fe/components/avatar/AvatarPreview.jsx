
export default function AvatarPreview({ character, nickname }) {
  return (
    <div className="flex flex-col items-center rounded-xl p-[3rem]">
      
      <CroppedAvatar
        src={character.src}
        alt={character.name}
      />

      <p className="mt-[2rem] text-4xl font-semibold">{nickname}</p>
      <p className="mt-[0.5rem] text-3xl text-gray-400">{character.name}</p>
    </div>
  );
}


export function CroppedAvatar({ src, alt }) {
  return (
    <div className="w-[20rem] h-[20rem] overflow-hidden rounded-md">
      <img
        src={src}
        alt={alt}
        className="w-[256px] h-[256px] object-cover transform scale-300 translate-x-[-90px] translate-y-[255px]"
      />
    </div>
  );
}
