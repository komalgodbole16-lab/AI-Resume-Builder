import { FilePenLineIcon, LoaderCircleIcon, PencilIcon, PlusIcon, TrashIcon, UploadCloud, UploadCloudIcon, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { dummyResumeData } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../configs/api.js";
import toast from "react-hot-toast";
import pdfToText from 'react-pdftotext';

const Dashboard = () => {
  const { user, token } = useSelector(state => state.auth)

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"];
  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [editResumeId, setEditResumeId] = useState(false);
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState(null);
  const [resumeId, setResumeId] = useState(null);

  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate();

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get('/api/resumes', { headers: { Authorization: `Bearer ${token}` } })
      setAllResumes(data.resumes)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const createResume = async (event) => {
    event.preventDefault()
    try {
      const { data } = await api.post('/api/resumes/create', { title }, { headers: { Authorization: `Bearer ${token}` } })
      setAllResumes([...allResumes, data.resume])
      setTitle('')
      setShowCreateResume(false)
      navigate(`/app/builder/${data.resume._id}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const uploadResume = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const resumeText = await pdfToText(resume)
      const { data } = await api.post('/api/ai/upload-resume', { title, resumeText }, { headers: { Authorization: token } })
      setTitle('')
      setResume(null)
      setShowUploadResume(false)
      navigate(`/app/builder/${data.resumeId}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Something went wrong")
    }
    setIsLoading(false)
  }

  const editTitle = async (event) => {
    console.log("editTitle called!")
    try {
      event.preventDefault()
      const { data } = await api.put(`/api/resumes/update`, { resumeId: editResumeId, resumeData: JSON.stringify({ title }) }, { headers: { Authorization: `Bearer ${token}` } })
      setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume))
      setTitle('')
      setEditResumeId('')
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }

  }

  const deleteResume = async (resumeId) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this resume?')
      if (confirm) {
        const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, { headers: { Authorization: `Bearer ${token}`} })
        setAllResumes(allResumes.filter(resume => resume._id !== resumeId))
        toast.success(data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    loadAllResumes();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#020024] via-[#12042e] to-[#4b2e83] text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-80 h-80 bg-purple-600/20 blur-[120px] rounded-full"></div>

        <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Heading */}
        <h1 className="text-4xl font-bold mb-10 bg-linear-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
          Welcome
        </h1>

        {/* Action Cards */}
        <div className="flex flex-wrap gap-6">
          {/* Create Resume */}
          <button
            onClick={() => setShowCreateResume(true)}
            className=" w-full sm:w-44 h-56 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/10 hover:border-indigo-400 hover:scale-105 transition-all duration-300">
            <PlusIcon
              className="size-14 p-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-white" />

            <p className="font-medium text-white">
              Create Resume
            </p>
          </button>

          {/* Upload Resume */}
          <button onClick={() => setShowUploadResume(true)}
            className=" w-full sm:w-44 h-56 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/10 hover:border-purple-400 hover:scale-105 transition-all duration-300">
            <UploadCloudIcon className=" size-14 p-3 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white" />

            <p className="font-medium text-white">
              Upload Existing
            </p>
          </button>
        </div>

        <hr className="border-white/10 my-10" />

        {/* Resume Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allResumes.map((resume, index) => {
            const baseColor = colors[index % colors.length];

            return (
              <button
                key={index} onClick={() => navigate(`/app/builder/${resume._id}`)}
                className="
                  relative
                  h-64
                  rounded-2xl
                  border border-white/10
                  backdrop-blur-xl
                  bg-white/5
                  flex flex-col
                  items-center
                  justify-center
                  gap-3
                  hover:scale-105
                  hover:border-purple-400
                  hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]
                  transition-all duration-300
                  group
                "
              >
                <FilePenLineIcon
                  className="size-10 transition-all duration-300"
                  style={{ color: baseColor }}
                />

                <p className="text-white font-medium text-center px-4">
                  {resume.title}
                </p>

                <p className="absolute bottom-3 text-xs text-gray-400">
                  Updated on{" "}
                  {new Date(
                    resume.updatedAt
                  ).toLocaleDateString()}
                </p>

                {/* Action Icons */}
                <div onClick={e => e.stopPropagation()} className="absolute top-3 right-3 hidden group-hover:flex gap-2">
                  <TrashIcon onClick={() => deleteResume(resume._id)}
                    className="size-8 p-2 rounded-full bg-white/10 hover:bg-red-500 text-white transition-all" />

                  <PencilIcon onClick={() => { setEditResumeId(resume._id); setTitle(resume.title) }} className="size-8 p-2 rounded-full  bg-white/10 hover:bg-indigo-500 text-white transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Create Resume Modal */}
        {showCreateResume && (
          <div
            onClick={() => setShowCreateResume(false)}
            className="
              fixed inset-0
              bg-black/70
              backdrop-blur-sm
              flex items-center
              justify-center
              z-50
            "
          >
            <form
              onSubmit={createResume}
              onClick={(e) => e.stopPropagation()}
              className="
                relative
                w-full
                max-w-md
                p-6
                rounded-2xl
                bg-[#0f172a]
                border border-white/10
                backdrop-blur-xl
                shadow-2xl
              "
            >
              <h2 className="text-2xl font-semibold mb-5">
                Create Resume
              </h2>

              <input onChange={() => setTitle(e.target.value)} value={title}
                type="text"
                placeholder="Enter Resume Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="
                  w-full
                  px-4
                  py-3
                  rounded-lg
                  bg-white/5
                  border border-white/10
                  text-white
                  placeholder:text-gray-400
                  outline-none
                  focus:border-indigo-500
                  mb-5
                "
              />

              <button
                type="submit"
                className="
                  w-full
                  py-3
                  rounded-lg
                  bg-linear-to-r
                  from-indigo-500
                  to-purple-500
                  text-white
                  font-medium
                  hover:opacity-90
                  transition-all
                "
              >
                Create Resume
              </button>

              <XIcon
                onClick={() => {
                  setShowCreateResume(false);
                  setTitle("");
                }}
                className="
                  absolute
                  top-4
                  right-4
                  size-5 text-gray-400
                  cursor-pointer hover:text-white
                "
              />
            </form>
          </div>
        )}

        {showUploadResume && (
          <div
            onClick={() => setShowUploadResume(false)}
            className="
              fixed inset-0
              bg-black/70
              backdrop-blur-sm
              flex items-center
              justify-center
              z-50
            "
          >
            <form
              onSubmit={uploadResume}
              onClick={(e) => e.stopPropagation()}
              className="
                relative
                w-full
                max-w-md
                p-6
                rounded-2xl
                bg-[#0f172a]
                border border-white/10
                backdrop-blur-xl
                shadow-2xl
              "
            >
              <h2 className="text-2xl font-semibold mb-5">
                Upload Resume
              </h2>

              <input
                type="text" onChange={() => setTitle(e.target.value)} value={title}
                placeholder="Enter Resume Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="
                  w-full
                  px-4
                  py-3
                  rounded-lg
                  bg-white/5
                  border border-white/10
                  text-white
                  placeholder:text-gray-400
                  outline-none
                  focus:border-indigo-500
                  mb-5
                "
              />

              <div>
                <label htmlFor="resume-input" className="black text-sm text-slate-700">
                  Select resume File
                  <div className="flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-green-500 hover:text-green-700 cursor-pointer transition-colors">
                    {resume ? (
                      <p className="text-green-700">{resume.name}</p>
                    ) : (
                      <>
                        <UploadCloud className="size-14 stroke-1" />
                        <p>Upload Resume</p>
                      </>
                    )
                    }
                  </div>
                </label>
                <input type="file" id="resume-input" accept=".pdf" hidden onChange={(e) => setResume(e.target.files[0])} />
              </div>

              <button disabled={isLoading} type="submit" className="w-full py-3 rounded-lg bg-linear-to-r  from-indigo-500 to-purple-500 flex items-center justify-center gap-2 text-white font-medium hover:opacity-90 transition-colors">
                {isLoading && <LoaderCircleIcon className="animate-spin size-4 text-white" />}
                {isLoading ? 'Uploading...' : 'upload resume'}

              </button>

              <XIcon
                onClick={() => {
                  setShowUploadResume(false);
                  setTitle("");
                }}
                className="
                  absolute
                  top-4
                  right-4
                  size-5 text-gray-400
                  cursor-pointer hover:text-white
                "
              />
            </form>
          </div>
        )

        }

        {editResumeId && (
          <div
            onClick={() => setEditResumeId('')}
            className="
              fixed inset-0
              bg-black/70
              backdrop-blur-sm
              flex items-center
              justify-center
              z-50
            "
          >
            <form
              onSubmit={editTitle}
              onClick={(e) => e.stopPropagation()}
              className="
                relative
                w-full
                max-w-md
                p-6
                rounded-2xl
                bg-[#0f172a]
                border border-white/10
                backdrop-blur-xl
                shadow-2xl
              "
            >
              <h2 className="text-2xl font-semibold mb-5">
                Edit Resume Title
              </h2>

              <input type="text" placeholder="Enter Resume Title" value={title} onChange={(e) => setTitle(e.target.value)} required className=" w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white
 placeholder:text-gray-400
                  outline-none
                  focus:border-indigo-500
                  mb-5
                "
              />

              <button
                type="submit"
                className="
                  w-full
                  py-3
                  rounded-lg
                  bg-linear-to-r
                  from-indigo-500
                  to-purple-500
                  text-white
                  font-medium
                  hover:opacity-90
                  transition-all
                "
              >
                Update
              </button>

              <XIcon
                onClick={() => {
                  setEditResumeId('');
                  setTitle("");
                }}
                className="
                  absolute
                  top-4
                  right-4
                  size-5 text-gray-400
                  cursor-pointer hover:text-white
                "
              />
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;