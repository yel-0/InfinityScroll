import React, { useState, useRef, useEffect } from "react";
import { useInfiniteQuery } from "react-query";
import axios from "axios";
import { useInView } from "react-intersection-observer";

const Home = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const fetchPhotos = async (page = 1) => {
    const response = await axios.get("https://api.unsplash.com/photos", {
      params: {
        page: page,
        client_id: "98dZ2-zlMCr7_VWbQXBl87Tr7mwDb6ww21WTe7XNt6E",
      },
    });

    return response.data;
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    "randomPhotos",
    ({ pageParam }) => fetchPhotos(pageParam),
    {
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = allPages.length + 1;
        return nextPage;
      },
    }
  );

  const loadMoreTriggerRef = useRef(null);
  const { ref, inView } = useInView({
    threshold: 0, // Trigger when the element comes into view
  });
  function downloadImage(url, filename) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading the image:", error);
      });
  }

  useEffect(() => {
    const rootElement = document.documentElement;
    if (modalOpen) {
      rootElement.classList.add("modal-open");
    } else {
      rootElement.classList.remove("modal-open");
    }
  }, [modalOpen]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading && !isFetchingNextPage) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error occurred while fetching data</div>;
  }

  function openModal(photo) {
    setCurrentPhoto(photo);
    setModalOpen(true);
    console.log(modalOpen);
  }

  function closeModal() {
    setModalOpen(false);
    setCurrentPhoto(null);
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="grid grid-cols-2 sm:gap-4 gap-[1px]">
        {data.pages.map((page) =>
          page.map((photo) => (
            <div key={photo.id} className="relative">
              <img
                src={photo.urls.small}
                className="w-full h-[320px] sm:w-[400px] sm:h-[650px] object-cover"
                onClick={() => openModal(photo)}
              />
              {modalOpen && currentPhoto.id === photo.id && (
                <div id="myModal" className="modal" onClick={closeModal}>
                  <div className="modal-content h-full flex flex-col justify-center items-center">
                    <span className="modal-close" onClick={closeModal}>
                      &times;
                    </span>
                    <img
                      src={photo.urls.small}
                      className="object-scale-down h-38 w-66"
                      alt={photo.description}
                    />
                    <button
                      className="bg-blue-500 p-2 text-white mt-[2rem] rounded-lg "
                      onClick={() =>
                        downloadImage(
                          photo.urls.raw,
                          `${photo.id}.${photo.urls.raw.split(".").pop()}`
                        )
                      }
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div ref={ref} className="invisible">
        {/* This element is used as a trigger for the intersection */}
      </div>

      {isFetchingNextPage && <div>Loading more...</div>}
    </div>
  );
};

export default Home;
