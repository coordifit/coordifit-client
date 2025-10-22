import { useNavigate, useParams } from "react-router-dom";
import styles from "./CoordiDetail.module.css";
import classNames from "classnames/bind";
import { useCoordiByIdQuery } from "@/hooks/useCoordiQuery";
import ItemCarousel from "@/components/ItemCarousel/ItemCarousel";
import Button from "@/components/Button/Button";
import { deleteCoordi } from "@/services/coordiService";
import { useQueryClient } from "@tanstack/react-query";

const cx = classNames.bind(styles);

const CoordiDetail = () => {
  const navigate = useNavigate();
  const { coordiId } = useParams();
  const queryClient = useQueryClient();

  const { data: coordi = { data: [] }, isLoading } = useCoordiByIdQuery(coordiId);

  if (isLoading) {
    return <h1>loading</h1>;
  }

  const handleEditClick = () => {
    navigate(`/closet/coordi/editor/${coordiId}`);
  };

  const handleDeleteClick = async () => {
    if (!coordi) {
      alert("삭제할 데일리룩이 없습니다.");
      return;
    } else {
      await deleteCoordi(coordiId);

      queryClient.invalidateQueries(["coordi", coordiId]);
      queryClient.invalidateQueries(["coordis"]);

      alert("삭제가 완료되었습니다.");
      navigate(-1);
    }
  };

  return (
    <div className={cx("container")}>
      <div className={cx("wrapper")}>
        <img className={cx("image")} src={coordi.data?.originImageUrl} alt="Daily Look Thumbnail" />
      </div>
      <ItemCarousel items={JSON.parse(coordi.data?.canvasJson)} />
      <div className={cx("button-wrapper")}>
        <Button onClick={handleEditClick} style="default">
          수정하기
        </Button>
        <Button onClick={handleDeleteClick} style="secondary">
          삭제하기
        </Button>
      </div>
    </div>
  );
};

export default CoordiDetail;
