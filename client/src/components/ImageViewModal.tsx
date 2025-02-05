import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

const ImageViewModal = ({ imgUrl }: { imgUrl: string }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <img
          src={imgUrl}
          alt="Sent Image"
          className="w-96 h-auto rounded-lg object-cover shadow-md"
        />
      </DialogTrigger>
      {/* Full-Screen Image in Modal (80% width) */}
      <DialogContent className="flex justify-center items-center bg-black bg-opacity-90 p-0">
        <img
          src={imgUrl}
          alt="Full Image"
          className="w-full h-auto rounded-lg"
        />
      </DialogContent>
    </Dialog>
  )
}

export default ImageViewModal
