import FilesPage from "./Files";

const LibraryPage = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[892px] px-5 mx-auto">
        <div className="mt-6">
          <h3 className="text-2xl text-black dark:text-white font-semibold">
            Library
          </h3>
        </div>

        <FilesPage />
      </div>
    </div>
  );
};

export default LibraryPage;
