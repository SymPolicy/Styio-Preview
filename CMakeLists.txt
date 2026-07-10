cmake_minimum_required(VERSION 3.14)

project(styio_preview VERSION 0.0.1)

enable_testing()

add_subdirectory(styio)

foreach(STYIO_OPTIONAL_MODULE IN ITEMS styio-pafio vityo)
  if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/${STYIO_OPTIONAL_MODULE}/CMakeLists.txt")
    add_subdirectory("${STYIO_OPTIONAL_MODULE}")
  endif()
endforeach()
